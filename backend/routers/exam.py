import random
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db, ExamRepository, Subject, Question, ExamSession, ExamSessionQuestion, ExamAnswer, SubjectScore
from schemas import ExamSessionCreate, ExamSubmit, ExamResultOut, SubjectScoreOut

router = APIRouter(prefix="/api", tags=["exam"])


@router.post("/repositories/{repo_id}/exam-sessions", status_code=201)
def create_exam_session(repo_id: int, data: ExamSessionCreate, db: Session = Depends(get_db)):
    repo = db.query(ExamRepository).filter(ExamRepository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="저장소를 찾을 수 없습니다.")

    # 문제 풀 선택
    q_query = db.query(Question).filter(Question.repository_id == repo_id, Question.is_active == True)
    if data.mode == "subject" and data.subject_id:
        q_query = q_query.filter(Question.subject_id == data.subject_id)
    elif data.mode == "review" and data.base_session_id:
        wrong_answers = db.query(ExamAnswer).filter(
            ExamAnswer.exam_session_id == data.base_session_id,
            ExamAnswer.is_correct == False
        ).all()
        wrong_qids = [a.question_id for a in wrong_answers]
        if not wrong_qids:
            raise HTTPException(status_code=400, detail="오답이 없습니다. 훌륭합니다!")
        q_query = q_query.filter(Question.id.in_(wrong_qids))

    questions = q_query.all()
    if not questions:
        raise HTTPException(status_code=400, detail="출제 가능한 문제가 없습니다. 문제를 먼저 업로드해주세요.")

    if repo.randomize_questions:
        random.shuffle(questions)

    session = ExamSession(
        repository_id=repo_id,
        mode=data.mode,
        subject_id=data.subject_id,
        time_limit_minutes=repo.time_limit_minutes,
    )
    db.add(session)
    db.flush()

    for idx, q in enumerate(questions):
        sq = ExamSessionQuestion(
            exam_session_id=session.id,
            question_id=q.id,
            subject_id=q.subject_id,
            order_index=idx,
        )
        db.add(sq)

    db.commit()
    db.refresh(session)

    return {
        "session_id": session.id,
        "time_limit_minutes": session.time_limit_minutes,
        "questions": [
            {
                "order_index": sq.order_index,
                "question_id": sq.question_id,
                "subject_id": sq.subject_id,
                "question_text": sq.question.question_text,
                "options": [
                    sq.question.option_1,
                    sq.question.option_2,
                    sq.question.option_3,
                    sq.question.option_4,
                ],
                "marked_for_review": False,
                "selected_answer": None,
            }
            for sq in sorted(session.session_questions, key=lambda x: x.order_index)
        ]
    }


@router.post("/exam-sessions/{session_id}/submit", response_model=ExamResultOut)
def submit_exam(session_id: int, data: ExamSubmit, db: Session = Depends(get_db)):
    session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다.")
    if session.submitted_at:
        raise HTTPException(status_code=400, detail="이미 제출된 시험입니다.")

    repo = db.query(ExamRepository).filter(ExamRepository.id == session.repository_id).first()
    subjects = {s.id: s for s in db.query(Subject).filter(Subject.repository_id == session.repository_id).all()}
    questions = {q.id: q for q in db.query(Question).filter(Question.repository_id == session.repository_id).all()}

    # 답안 저장 및 채점
    answer_map = {a.question_id: a for a in data.answers}
    subject_stats: dict[int, dict] = {}

    for sq in session.session_questions:
        qid = sq.question_id
        q = questions.get(qid)
        if not q:
            continue
        sid = sq.subject_id
        ans_data = answer_map.get(qid)
        selected = ans_data.selected_answer if ans_data else None
        is_correct = (selected == q.correct_answer) if selected is not None else False

        answer = ExamAnswer(
            exam_session_id=session_id,
            question_id=qid,
            selected_answer=selected,
            is_correct=is_correct,
            answered_at=datetime.utcnow() if selected else None,
            marked_for_review=ans_data.marked_for_review if ans_data else False,
        )
        db.add(answer)

        if sid not in subject_stats:
            subject_stats[sid] = {"correct": 0, "total": 0}
        subject_stats[sid]["total"] += 1
        if is_correct:
            subject_stats[sid]["correct"] += 1

    # 과목별 점수 저장
    subject_score_list = []
    failed_subjects = []
    for sid, stats in subject_stats.items():
        score = (stats["correct"] / stats["total"] * 100) if stats["total"] > 0 else 0.0
        is_fail = repo.is_subject_fail_enabled and score < repo.fail_threshold_score
        if is_fail:
            failed_subjects.append(subjects[sid].name if sid in subjects else f"과목{sid}")

        ss = SubjectScore(
            exam_session_id=session_id,
            subject_id=sid,
            correct_count=stats["correct"],
            total_count=stats["total"],
            score=round(score, 2),
            is_failed_subject=is_fail,
        )
        db.add(ss)
        db.flush()
        subject_score_list.append({
            "subject_id": sid,
            "subject_name": subjects[sid].name if sid in subjects else f"과목{sid}",
            "correct_count": stats["correct"],
            "total_count": stats["total"],
            "score": round(score, 2),
            "is_failed_subject": is_fail,
        })

    # 전체 채점
    total_correct = sum(s["correct"] for s in subject_stats.values())
    total_questions = sum(s["total"] for s in subject_stats.values())
    avg_score = round(sum(s["score"] for s in subject_score_list) / len(subject_score_list), 2) if subject_score_list else 0.0

    if failed_subjects:
        pass_status = "fail_subject"
        fail_reason = f"과락 과목: {', '.join(failed_subjects)}"
    elif avg_score >= repo.passing_score:
        pass_status = "pass"
        fail_reason = None
    else:
        pass_status = "fail"
        fail_reason = f"평균 점수 {avg_score}점 (합격 기준: {repo.passing_score}점)"

    session.submitted_at = datetime.utcnow()
    session.total_score = avg_score
    session.average_score = avg_score
    session.pass_status = pass_status
    session.fail_reason = fail_reason
    db.commit()

    return ExamResultOut(
        session_id=session_id,
        repository_name=repo.name,
        mode=session.mode,
        total_score=avg_score,
        average_score=avg_score,
        pass_status=pass_status,
        fail_reason=fail_reason,
        subject_scores=[SubjectScoreOut(**s) for s in subject_score_list],
        total_questions=total_questions,
        correct_count=total_correct,
    )


@router.get("/exam-sessions/{session_id}/result", response_model=ExamResultOut)
def get_result(session_id: int, db: Session = Depends(get_db)):
    session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
    if not session or not session.submitted_at:
        raise HTTPException(status_code=404, detail="결과를 찾을 수 없습니다.")
    repo = db.query(ExamRepository).filter(ExamRepository.id == session.repository_id).first()
    subjects = {s.id: s.name for s in db.query(Subject).filter(Subject.repository_id == session.repository_id).all()}
    total_correct = sum(a.is_correct for a in session.answers if a.is_correct)
    return ExamResultOut(
        session_id=session_id,
        repository_name=repo.name,
        mode=session.mode,
        total_score=session.total_score or 0,
        average_score=session.average_score or 0,
        pass_status=session.pass_status or "fail",
        fail_reason=session.fail_reason,
        subject_scores=[
            SubjectScoreOut(
                subject_id=ss.subject_id,
                subject_name=subjects.get(ss.subject_id, ""),
                correct_count=ss.correct_count,
                total_count=ss.total_count,
                score=ss.score,
                is_failed_subject=ss.is_failed_subject,
            )
            for ss in session.subject_scores
        ],
        total_questions=len(session.session_questions),
        correct_count=total_correct,
    )


from fastapi import Query

@router.get("/exam-sessions/history")
def get_exam_history(session_ids: str = Query(..., description="Comma separated session IDs"), db: Session = Depends(get_db)):
    if not session_ids:
        return []
    ids = [int(sid) for sid in session_ids.split(",") if sid.strip().isdigit()]
    if not ids:
        return []
        
    from db import ExamRepository
    sessions = db.query(ExamSession).filter(ExamSession.id.in_(ids)).order_by(ExamSession.created_at.desc()).all()
    repos = {r.id: r.name for r in db.query(ExamRepository).all()}
    
    history = []
    for s in sessions:
        if not s.submitted_at:
            continue
        history.append({
            "session_id": s.id,
            "repository_id": s.repository_id,
            "repository_name": repos.get(s.repository_id, "Unknown"),
            "mode": s.mode,
            "total_score": s.total_score,
            "pass_status": s.pass_status,
            "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None,
        })
    return history
