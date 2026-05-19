from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ── Repository ───────────────────────────────────────────────────────────────
class RepositoryCreate(BaseModel):
    name: str
    description: str = ""
    category: str = ""
    total_questions: int
    time_limit_minutes: int
    passing_score: float = 70.0
    fail_threshold_score: float = 40.0
    is_subject_fail_enabled: bool = True
    option_count: int = 4
    randomize_questions: bool = False
    randomize_options: bool = False

class RepositoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    passing_score: Optional[float] = None
    fail_threshold_score: Optional[float] = None
    is_subject_fail_enabled: Optional[bool] = None
    is_active: Optional[bool] = None

class RepositoryOut(BaseModel):
    id: int
    name: str
    description: str
    category: str
    total_questions: int
    time_limit_minutes: int
    passing_score: float
    fail_threshold_score: float
    is_subject_fail_enabled: bool
    option_count: int
    randomize_questions: bool
    is_active: bool
    created_at: datetime
    class Config: from_attributes = True


# ── Subject ───────────────────────────────────────────────────────────────────
class SubjectCreate(BaseModel):
    name: str
    description: str = ""
    question_count: int
    order_index: int = 0

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    question_count: Optional[int] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None

class SubjectOut(BaseModel):
    id: int
    repository_id: int
    name: str
    description: str
    question_count: int
    order_index: int
    is_active: bool
    class Config: from_attributes = True


# ── Question ──────────────────────────────────────────────────────────────────
class QuestionOut(BaseModel):
    id: int
    repository_id: int
    subject_id: int
    question_text: str
    option_1: str
    option_2: str
    option_3: str
    option_4: str
    correct_answer: int
    explanation: str
    difficulty: str
    source: str
    tags: str
    is_active: bool
    class Config: from_attributes = True


# ── Exam ──────────────────────────────────────────────────────────────────────
class ExamSessionCreate(BaseModel):
    mode: str = "full"          # full | subject | review
    subject_id: Optional[int] = None  # subject 모드일 때만
    base_session_id: Optional[int] = None # review 모드일 때 참조할 이전 시험 세션 ID

class AnswerSubmit(BaseModel):
    question_id: int
    selected_answer: Optional[int] = None
    marked_for_review: bool = False

class ExamSubmit(BaseModel):
    answers: List[AnswerSubmit]


# ── Result ────────────────────────────────────────────────────────────────────
class SubjectScoreOut(BaseModel):
    subject_id: int
    subject_name: str
    correct_count: int
    total_count: int
    score: float
    is_failed_subject: bool
    class Config: from_attributes = True

class ExamResultOut(BaseModel):
    session_id: int
    repository_name: str
    mode: str
    total_score: float
    average_score: float
    pass_status: str
    fail_reason: Optional[str]
    subject_scores: List[SubjectScoreOut]
    total_questions: int
    correct_count: int
