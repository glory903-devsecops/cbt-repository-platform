from sqlalchemy import create_engine, Column, Integer, String, Boolean, Float, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

# 환경변수 DATABASE_URL이 있으면 PostgreSQL(Supabase), 없으면 로컬 SQLite
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./cbt.db")

# Supabase는 postgresql:// 스킴을 사용 (SQLAlchemy는 postgresql+psycopg2 필요)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# PostgreSQL vs SQLite 설정 분기
if DATABASE_URL.startswith("postgresql"):
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
else:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Models ──────────────────────────────────────────────────────────────────

class ExamRepository(Base):
    __tablename__ = "exam_repositories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, default="")
    category = Column(String(100), default="")
    total_questions = Column(Integer, nullable=False)
    time_limit_minutes = Column(Integer, nullable=False)
    passing_score = Column(Float, nullable=False, default=70.0)
    fail_threshold_score = Column(Float, default=40.0)
    is_subject_fail_enabled = Column(Boolean, default=True)
    option_count = Column(Integer, default=4)
    randomize_questions = Column(Boolean, default=False)
    randomize_options = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    subjects = relationship("Subject", back_populates="repository", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="repository", cascade="all, delete-orphan")


class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    repository_id = Column(Integer, ForeignKey("exam_repositories.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, default="")
    question_count = Column(Integer, nullable=False, default=0)
    order_index = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    repository = relationship("ExamRepository", back_populates="subjects")
    questions = relationship("Question", back_populates="subject")


class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    repository_id = Column(Integer, ForeignKey("exam_repositories.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    option_1 = Column(Text, nullable=False)
    option_2 = Column(Text, nullable=False)
    option_3 = Column(Text, nullable=False)
    option_4 = Column(Text, nullable=False)
    correct_answer = Column(Integer, nullable=False)  # 1~4
    explanation = Column(Text, default="")
    difficulty = Column(String(20), default="보통")
    source = Column(String(200), default="")
    tags = Column(String(300), default="")
    chapter = Column(String(100), default="")
    year = Column(Integer, default=None)
    question_number = Column(Integer, default=None)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    repository = relationship("ExamRepository", back_populates="questions")
    subject = relationship("Subject", back_populates="questions")


class ExamSession(Base):
    __tablename__ = "exam_sessions"
    id = Column(Integer, primary_key=True, index=True)
    repository_id = Column(Integer, ForeignKey("exam_repositories.id"), nullable=False)
    mode = Column(String(50), default="full")  # full | subject | review
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)
    time_limit_minutes = Column(Integer, nullable=False)
    total_score = Column(Float, nullable=True)
    average_score = Column(Float, nullable=True)
    pass_status = Column(String(20), nullable=True)  # pass | fail | fail_subject
    fail_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    answers = relationship("ExamAnswer", back_populates="session", cascade="all, delete-orphan")
    subject_scores = relationship("SubjectScore", back_populates="session", cascade="all, delete-orphan")
    session_questions = relationship("ExamSessionQuestion", back_populates="session", cascade="all, delete-orphan")


class ExamSessionQuestion(Base):
    __tablename__ = "exam_session_questions"
    id = Column(Integer, primary_key=True, index=True)
    exam_session_id = Column(Integer, ForeignKey("exam_sessions.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    order_index = Column(Integer, default=0)

    session = relationship("ExamSession", back_populates="session_questions")
    question = relationship("Question")


class ExamAnswer(Base):
    __tablename__ = "exam_answers"
    id = Column(Integer, primary_key=True, index=True)
    exam_session_id = Column(Integer, ForeignKey("exam_sessions.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    selected_answer = Column(Integer, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    answered_at = Column(DateTime, nullable=True)
    marked_for_review = Column(Boolean, default=False)

    session = relationship("ExamSession", back_populates="answers")
    question = relationship("Question")


class SubjectScore(Base):
    __tablename__ = "subject_scores"
    id = Column(Integer, primary_key=True, index=True)
    exam_session_id = Column(Integer, ForeignKey("exam_sessions.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    correct_count = Column(Integer, default=0)
    total_count = Column(Integer, default=0)
    score = Column(Float, default=0.0)
    is_failed_subject = Column(Boolean, default=False)

    session = relationship("ExamSession", back_populates="subject_scores")
    subject = relationship("Subject")


def create_tables():
    global engine, SessionLocal
    try:
        # Try to connect and create tables using the configured engine (PostgreSQL or SQLite)
        Base.metadata.create_all(bind=engine)
        print("Successfully connected to the database and ensured tables exist.")
    except Exception as e:
        print(f"Failed to connect to the primary database. Error: {e}")
        print("Falling back to local SQLite database (sqlite:///./cbt_fallback.db)...")
        # Fallback to SQLite
        fallback_url = "sqlite:///./cbt_fallback.db"
        engine = create_engine(fallback_url, connect_args={"check_same_thread": False})
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        Base.metadata.create_all(bind=engine)
        print("Successfully created fallback SQLite database.")
