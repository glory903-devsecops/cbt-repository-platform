# CBT Repository Platform

> 자격시험 CBT 저장소 생성·운영 플랫폼

사용자가 보유한 문제 데이터를 업로드하여 자격시험별 CBT 저장소를 생성하고, 시험 기준·과목·합격/과락 기준에 따라 실전 응시, 채점, 취약 과목 복습을 지원하는 확장형 CBT 플랫폼입니다.

## 🎯 초기 검증 대상

**산업보안관리사** (총 125문항, 5과목, 제한 120분, 평균 70점 합격)

## 📚 확장 대상

- 정보보안기사
- 정보처리기사
- 정보통신기사

## 📋 기획서

[cbt-repository-platform_project_plan.md](./cbt-repository-platform_project_plan.md)

## 🌐 데모 사이트

GitHub Pages: https://glory903-devsecops.github.io/cbt-repository-platform/

## 🏗️ 기술 스택

| 구분 | 기술 |
|---|---|
| Frontend | React / Next.js, Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | SQLite (MVP) → PostgreSQL |
| Deployment | GitHub Pages / Vercel / Render |

## 📁 저장소 구조

```
cbt-repository-platform/
├── docs/                  # GitHub Pages 데모 사이트
│   ├── index.html
│   ├── style.css
│   └── script.js
├── cbt-repository-platform_project_plan.md  # 프로젝트 기획서
└── README.md
```

## 📌 개발 단계

- **1차 MVP**: CBT 저장소 생성, 문제 CSV 업로드, 실전 모의고사, 자동 채점, 과락 판정
- **2차 고도화**: 오답노트, 취약 과목 집중 출제, 미니 CBT, 응시 이력 대시보드
- **3차 고도화**: PDF 문제 추출, 다중 사용자 계정, 학습 리포트 PDF 출력
