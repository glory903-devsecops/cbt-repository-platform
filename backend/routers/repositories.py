from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db, ExamRepository, Subject
from schemas import RepositoryCreate, RepositoryUpdate, RepositoryOut, SubjectOut
from typing import List
from datetime import datetime

router = APIRouter(prefix="/api/repositories", tags=["repositories"])


@router.post("", response_model=RepositoryOut, status_code=201)
def create_repository(data: RepositoryCreate, db: Session = Depends(get_db)):
    repo = ExamRepository(**data.model_dump())
    db.add(repo)
    db.commit()
    db.refresh(repo)
    return repo


@router.get("", response_model=List[RepositoryOut])
def list_repositories(db: Session = Depends(get_db)):
    return db.query(ExamRepository).order_by(ExamRepository.created_at.desc()).all()


@router.get("/{repo_id}", response_model=RepositoryOut)
def get_repository(repo_id: int, db: Session = Depends(get_db)):
    repo = db.query(ExamRepository).filter(ExamRepository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="저장소를 찾을 수 없습니다.")
    return repo


@router.patch("/{repo_id}", response_model=RepositoryOut)
def update_repository(repo_id: int, data: RepositoryUpdate, db: Session = Depends(get_db)):
    repo = db.query(ExamRepository).filter(ExamRepository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="저장소를 찾을 수 없습니다.")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(repo, k, v)
    repo.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(repo)
    return repo


@router.delete("/{repo_id}", status_code=204)
def delete_repository(repo_id: int, db: Session = Depends(get_db)):
    repo = db.query(ExamRepository).filter(ExamRepository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="저장소를 찾을 수 없습니다.")
    db.delete(repo)
    db.commit()


# ── Subjects under a Repository ───────────────────────────────────────────────
from schemas import SubjectCreate, SubjectUpdate

@router.post("/{repo_id}/subjects", response_model=SubjectOut, status_code=201)
def create_subject(repo_id: int, data: SubjectCreate, db: Session = Depends(get_db)):
    repo = db.query(ExamRepository).filter(ExamRepository.id == repo_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="저장소를 찾을 수 없습니다.")
    subject = Subject(repository_id=repo_id, **data.model_dump())
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject


@router.get("/{repo_id}/subjects", response_model=List[SubjectOut])
def list_subjects(repo_id: int, db: Session = Depends(get_db)):
    return db.query(Subject).filter(Subject.repository_id == repo_id).order_by(Subject.order_index).all()


@router.patch("/subjects/{subject_id}", response_model=SubjectOut)
def update_subject(subject_id: int, data: SubjectUpdate, db: Session = Depends(get_db)):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="과목을 찾을 수 없습니다.")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(subject, k, v)
    db.commit()
    db.refresh(subject)
    return subject


@router.delete("/subjects/{subject_id}", status_code=204)
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="과목을 찾을 수 없습니다.")
    db.delete(subject)
    db.commit()
