import io
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from db import get_db, ExamRepository, Subject, Question
from schemas import QuestionOut
from typing import List

router = APIRouter(prefix="/api/repositories", tags=["questions"])


@router.get("/{repo_id}/questions", response_model=List[QuestionOut])
def list_questions(
    repo_id: int,
    subject_id: int = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(Question).filter(Question.repository_id == repo_id, Question.is_active == True)
    if subject_id:
        q = q.filter(Question.subject_id == subject_id)
    return q.all()


@router.post("/{repo_id}/questions/upload")
async def upload_questions(
    repo_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    repo = db.query(ExamRepository).filter(ExamRepository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="저장소를 찾을 수 없습니다.")

    content = await file.read()
    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content), encoding="utf-8-sig")
        else:
            df = pd.read_excel(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"파일 파싱 오류: {str(e)}")

    required = ["subject_name", "question_text", "option_1", "option_2",
                "option_3", "option_4", "correct_answer"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise HTTPException(status_code=400, detail=f"필수 컬럼 누락: {missing}")

    created, skipped = 0, 0
    for _, row in df.iterrows():
        # 과목 조회 또는 생성
        subj_name = str(row["subject_name"]).strip()
        subject = db.query(Subject).filter(
            Subject.repository_id == repo_id,
            Subject.name == subj_name
        ).first()
        if not subject:
            subject = Subject(
                repository_id=repo_id,
                name=subj_name,
                question_count=0,
                order_index=db.query(Subject).filter(Subject.repository_id == repo_id).count()
            )
            db.add(subject)
            db.flush()

        try:
            correct = int(row["correct_answer"])
            if correct not in [1, 2, 3, 4]:
                skipped += 1
                continue
        except Exception:
            skipped += 1
            continue

        question = Question(
            repository_id=repo_id,
            subject_id=subject.id,
            question_text=str(row["question_text"]).strip(),
            option_1=str(row["option_1"]).strip(),
            option_2=str(row["option_2"]).strip(),
            option_3=str(row["option_3"]).strip(),
            option_4=str(row["option_4"]).strip(),
            correct_answer=correct,
            explanation=str(row.get("explanation", "")).strip(),
            difficulty=str(row.get("difficulty", "보통")).strip(),
            source=str(row.get("source", "")).strip(),
            tags=str(row.get("tags", "")).strip(),
            chapter=str(row.get("chapter", "")).strip(),
            year=int(row["year"]) if "year" in row and pd.notna(row.get("year")) else None,
            question_number=int(row["question_number"]) if "question_number" in row and pd.notna(row.get("question_number")) else None,
        )
        db.add(question)
        created += 1

    db.commit()
    return {"created": created, "skipped": skipped, "message": f"{created}개 문제가 업로드되었습니다."}


@router.patch("/{repo_id}/questions/{q_id}", response_model=QuestionOut)
def update_question(repo_id: int, q_id: int, data: dict, db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == q_id, Question.repository_id == repo_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="문제를 찾을 수 없습니다.")
    for k, v in data.items():
        if hasattr(q, k):
            setattr(q, k, v)
    db.commit()
    db.refresh(q)
    return q


@router.delete("/{repo_id}/questions/{q_id}", status_code=204)
def delete_question(repo_id: int, q_id: int, db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == q_id, Question.repository_id == repo_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="문제를 찾을 수 없습니다.")
    db.delete(q)
    db.commit()
