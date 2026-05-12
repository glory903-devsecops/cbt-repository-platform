from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import create_tables
from routers import repositories, questions, exam

app = FastAPI(
    title="CBT Repository Platform API",
    description="자격시험 CBT 저장소 생성·운영 플랫폼 REST API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(repositories.router)
app.include_router(questions.router)
app.include_router(exam.router)


@app.on_event("startup")
def startup():
    create_tables()


@app.get("/")
def root():
    return {"message": "CBT Repository Platform API", "docs": "/docs"}
