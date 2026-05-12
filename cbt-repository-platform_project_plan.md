# CBT Repository Platform 프로젝트 기획서

## 1. 프로젝트명

**CBT Repository Platform**

GitHub Repository Name:

```text
cbt-repository-platform
```

국문명:

```text
자격시험 CBT 저장소 생성·운영 플랫폼
```

한 줄 정의:

```text
사용자가 보유한 문제 데이터를 업로드하여 자격시험별 CBT 저장소를 생성하고, 시험 기준·과목·문항 수·합격/과락 기준에 따라 실전 응시, 채점, 취약 과목 복습을 지원하는 확장형 CBT 플랫폼
```

---

## 2. 프로젝트 배경

산업보안관리사는 기출문제 기반으로 반복 학습할 수 있는 공개 CBT 환경이 부족합니다.  
사용자는 문제 자체를 새로 생성하려는 것이 아니라, 이미 보유한 문제집·PDF·정리 문제·예상 문제 데이터를 CBT 형태로 운영하고자 합니다.

따라서 본 프로젝트는 특정 시험 하나에 종속된 앱이 아니라, 플랫폼 내부에서 **CBT 저장소**를 생성하고 각 저장소마다 독립적인 시험 기준과 문제은행을 운영할 수 있는 구조로 개발합니다.

초기 검증 대상은 **산업보안관리사**로 설정합니다.  
향후 확장 대상은 다음과 같습니다.

- 정보보안기사
- 정보처리기사
- 정보통신기사
- 기타 보안·IT·기술 자격시험

---

## 3. 프로젝트 목표

본 플랫폼의 목표는 다음과 같습니다.

1. 사용자가 직접 CBT 저장소를 생성할 수 있게 한다.
2. 각 CBT 저장소별로 과목, 문항 수, 제한 시간, 합격 기준, 과락 기준을 설정할 수 있게 한다.
3. 문제를 하드코딩하지 않고 CSV/Excel/관리자 입력 방식으로 등록한다.
4. 등록된 문제를 기반으로 실전 모의고사, 과목별 풀이, 미니 CBT, 오답 복습, 취약 과목 집중 학습을 제공한다.
5. PC와 모바일 모두에서 문제를 풀기 쉬운 반응형 CBT UX를 제공한다.
6. 초기에는 산업보안관리사 기준으로 기능을 검증하되, 구조는 처음부터 다중 자격시험 확장이 가능하도록 설계한다.

---

## 4. 초기 검증 시험: 산업보안관리사

초기 테스트용 CBT 저장소는 산업보안관리사로 생성합니다.

공식 기준 기반 초기 설정값은 다음과 같습니다.

| 항목 | 설정값 |
|---|---|
| 시험명 | 산업보안관리사 |
| 문제 수 | 총 125문항 |
| 제한 시간 | 120분 |
| 문제 유형 | 객관식 4지 택일형 |
| 합격 기준 | 전 과목 평균 70점 이상 |
| 과락 기준 | 5과목 중 단일 과목 40점 미만 시 불합격 |
| 유효기간 참고 | 취득일로부터 3년, 보수교육 갱신 가능 |

초기 과목 구조:

| 순서 | 과목명 | 문항 수 |
|---:|---|---:|
| 1 | 관리적보안 | 25 |
| 2 | 물리적보안 | 25 |
| 3 | 기술적보안 | 25 |
| 4 | 보안사고대응 | 25 |
| 5 | 보안지식경영 | 25 |

참고 출처:

```text
한국산업기술보호협회 산업보안관리사 자격검정 안내
https://license.kaits.or.kr/license/web/content.do?menu_cd=000008
```

---

## 5. 핵심 제품 개념

본 플랫폼의 핵심 개념은 **CBT Repository**입니다.

CBT Repository는 하나의 자격시험 문제은행과 시험 기준을 담는 독립 저장소입니다.

예시:

```text
CBT Repository Platform
├─ 산업보안관리사 CBT Repository
│  ├─ 시험 기준
│  ├─ 과목 구조
│  ├─ 문제은행
│  ├─ 응시 이력
│  └─ 취약 과목 분석
│
├─ 정보보안기사 CBT Repository
│  ├─ 시험 기준
│  ├─ 과목 구조
│  ├─ 문제은행
│  ├─ 응시 이력
│  └─ 취약 과목 분석
│
└─ 정보처리기사 CBT Repository
   ├─ 시험 기준
   ├─ 과목 구조
   ├─ 문제은행
   ├─ 응시 이력
   └─ 취약 과목 분석
```

중요 원칙:

```text
과목명, 과목 수, 문항 수, 제한 시간, 합격 기준, 과락 기준은 코드에 하드코딩하지 않는다.
모든 시험 기준은 CBT 저장소 생성 시 관리자가 설정한다.
```

---

## 6. 사용자 흐름

### 관리자 흐름

```text
1. CBT 저장소 생성
2. 시험 기준 입력
3. 과목 생성
4. 과목별 문항 수 설정
5. 문제 업로드
6. 문제 검수
7. 출제 규칙 설정
8. CBT 저장소 활성화
```

### 학습자 흐름

```text
1. CBT 저장소 선택
2. 응시 모드 선택
3. 문제 풀이
4. 제출
5. 자동 채점
6. 합격/불합격/과락 결과 확인
7. 오답 확인
8. 취약 과목 집중 복습
```

---

## 7. 주요 기능

### 7.1 CBT 저장소 생성

관리자는 새로운 CBT 저장소를 만들 수 있어야 합니다.

필수 입력값:

```text
- 저장소명
- 설명
- 시험 카테고리
- 총 문항 수
- 제한 시간
- 합격 기준
- 과락 기준 사용 여부
- 과락 점수
- 보기 개수
- 랜덤 출제 여부
```

예시:

```text
저장소명: 산업보안관리사
총 문항 수: 125
제한 시간: 120분
합격 기준: 평균 70점 이상
과락 기준: 과목별 40점 미만
보기 개수: 4개
```

---

### 7.2 과목 관리

각 CBT 저장소는 독립적인 과목 구조를 가져야 합니다.

기능:

```text
- 과목 추가
- 과목 수정
- 과목 삭제
- 과목 순서 변경
- 과목별 출제 문항 수 설정
```

예시:

```text
산업보안관리사
- 관리적보안: 25문항
- 물리적보안: 25문항
- 기술적보안: 25문항
- 보안사고대응: 25문항
- 보안지식경영: 25문항
```

---

### 7.3 문제 업로드

초기 MVP에서는 CSV/Excel 업로드를 우선 지원합니다.  
PDF 자동 추출은 2차 고도화 기능으로 분리합니다.

필수 컬럼:

```text
repository_name
subject_name
question_text
option_1
option_2
option_3
option_4
correct_answer
explanation
difficulty
source
tags
```

권장 컬럼:

```text
chapter
year
question_number
is_active
```

문제 업로드 후 검수 항목:

```text
- 과목 미지정 문제
- 정답 누락 문제
- 보기 누락 문제
- 중복 의심 문제
- 해설 누락 문제
- 비활성 문제
```

---

### 7.4 시험 응시 모드

제공할 응시 모드는 다음과 같습니다.

| 모드 | 설명 |
|---|---|
| 실전 모의고사 | CBT 저장소 기준에 맞춰 전체 문항 출제 |
| 과목별 풀이 | 선택한 과목에서만 문제 출제 |
| 미니 CBT | 5문항, 10문항, 20문항 등 짧은 학습 |
| 오답 복습 | 틀린 문제 중심 재출제 |
| 취약 과목 집중 | 정답률 낮은 과목과 과락 위험 과목 우선 출제 |

초기 MVP 필수 모드:

```text
- 실전 모의고사
- 과목별 풀이
- 오답 복습
```

---

### 7.5 채점 및 과락 판정

채점 로직은 CBT 저장소별 설정값을 기준으로 작동해야 합니다.

기본 계산식:

```text
과목별 점수 = 과목별 정답 수 / 과목별 출제 문항 수 × 100
전체 평균 = 전체 과목 점수의 평균
```

산업보안관리사 예시 판정:

```text
합격:
- 전체 평균 70점 이상
- 모든 과목 40점 이상

불합격:
- 전체 평균 70점 미만

과락 불합격:
- 하나 이상의 과목이 40점 미만
```

결과 화면 표시 항목:

```text
- 전체 점수
- 전체 평균
- 과목별 점수
- 과목별 정답 수
- 합격/불합격
- 과락 여부
- 과락 과목
- 취약 과목
- 추천 복습 과목
```

---

### 7.6 취약 과목 분석

취약 과목은 단순 오답 수가 아니라 다음 요소를 종합해 계산합니다.

```text
취약도 점수 =
(100 - 과목 정답률)
+ 과락 위험 가중치
+ 최근 오답 빈도
+ 장기 미학습 가중치
```

추천 로직:

```text
1순위: 과락 기준 미달 과목
2순위: 평균 이하 과목
3순위: 최근 오답률 높은 과목
4순위: 장기간 미풀이 과목
```

---

## 8. 모바일 UX 설계

본 플랫폼은 모바일에서도 쉽게 풀 수 있어야 하므로 Mobile-first UX를 적용합니다.

### 모바일 기본 구조

```text
상단 고정 영역
- CBT 저장소명
- 남은 시간
- 현재 문제 번호 / 전체 문항 수
- 제출 버튼

본문 영역
- 과목명
- 문제 지문
- 보기 1~4번 카드형 버튼
- 제출 후 해설

하단 고정 영역
- 이전 문제
- 문제 목록
- 다음 문제
```

### 모바일 핵심 원칙

```text
- 한 화면에 한 문제만 표시한다.
- 선택지는 작은 라디오 버튼이 아니라 카드형 터치 버튼으로 제공한다.
- 문제 목록은 우측 패널이 아니라 바텀시트로 제공한다.
- 답안 선택 상태는 자동 저장한다.
- 새로고침, 화면 잠금, 브라우저 종료 이후에도 복구 가능해야 한다.
- 제출 전 확인 모달을 제공한다.
```

문제 목록 상태값:

```text
회색: 미풀이
파란색: 풀이 완료
노란색: 다시 보기
빨간색: 제출 후 오답
초록색: 제출 후 정답
```

---

## 9. 화면 구성

초기 화면 구조:

```text
홈
├─ CBT 저장소 목록
├─ 최근 응시 기록
└─ 취약 과목 요약

CBT 저장소 관리
├─ 저장소 생성
├─ 저장소 상세
├─ 시험 기준 설정
└─ 과목 설정

문제 관리
├─ 문제 업로드
├─ 문제 목록
├─ 문제 수정
└─ 문제 검수

시험 응시
├─ 실전 모의고사
├─ 과목별 풀이
├─ 미니 CBT
└─ 오답 복습

결과 분석
├─ 응시 결과
├─ 과목별 점수
├─ 과락 위험 분석
├─ 오답노트
└─ 추천 복습
```

---

## 10. 데이터베이스 초안

```text
exam_repositories
- id
- name
- description
- category
- total_questions
- time_limit_minutes
- passing_score
- fail_threshold_score
- is_subject_fail_enabled
- option_count
- randomize_questions
- randomize_options
- is_active
- created_at
- updated_at

subjects
- id
- repository_id
- name
- description
- question_count
- order_index
- is_active
- created_at
- updated_at

questions
- id
- repository_id
- subject_id
- chapter
- question_text
- option_1
- option_2
- option_3
- option_4
- correct_answer
- explanation
- difficulty
- source
- tags
- year
- question_number
- is_active
- created_at
- updated_at

exam_sessions
- id
- repository_id
- user_id
- mode
- started_at
- submitted_at
- time_limit_minutes
- total_score
- average_score
- pass_status
- fail_reason
- created_at

exam_session_questions
- id
- exam_session_id
- question_id
- subject_id
- order_index

exam_answers
- id
- exam_session_id
- question_id
- selected_answer
- is_correct
- answered_at
- marked_for_review

subject_scores
- id
- exam_session_id
- subject_id
- correct_count
- total_count
- score
- is_failed_subject

weakness_stats
- id
- repository_id
- user_id
- subject_id
- total_attempts
- correct_rate
- wrong_count
- weakness_score
- last_attempted_at
```

---

## 11. API 초안

```text
Repository API
- POST /api/repositories
- GET /api/repositories
- GET /api/repositories/{id}
- PATCH /api/repositories/{id}
- DELETE /api/repositories/{id}

Subject API
- POST /api/repositories/{id}/subjects
- GET /api/repositories/{id}/subjects
- PATCH /api/subjects/{id}
- DELETE /api/subjects/{id}

Question API
- POST /api/repositories/{id}/questions
- POST /api/repositories/{id}/questions/upload
- GET /api/repositories/{id}/questions
- PATCH /api/questions/{id}
- DELETE /api/questions/{id}

Exam API
- POST /api/repositories/{id}/exam-sessions
- GET /api/exam-sessions/{id}
- POST /api/exam-sessions/{id}/answers
- POST /api/exam-sessions/{id}/submit

Result API
- GET /api/exam-sessions/{id}/result
- GET /api/repositories/{id}/analytics
- GET /api/repositories/{id}/weakness
- GET /api/repositories/{id}/wrong-notes
```

---

## 12. 기술 스택

초기 권장 구조:

```text
Frontend:
- React 또는 Next.js
- Tailwind CSS
- 모바일 반응형 UI
- 카드형 문제 컴포넌트
- 바텀시트 문제 목록

Backend:
- FastAPI
- Python
- REST API

Database:
- SQLite 초기 MVP
- PostgreSQL 확장 가능 구조

Data Upload:
- CSV/Excel 업로드 우선
- PDF 텍스트 추출은 후속 고도화

Deployment:
- GitHub Repository
- GitHub Pages 또는 Vercel Frontend
- Render/Fly.io Backend
- Docker 기반 확장 가능
```

---

## 13. MVP 범위

### 1차 MVP

```text
- CBT 저장소 생성
- 시험 기준 설정
- 과목 생성
- 문제 CSV 업로드
- 문제 목록 조회
- 실전 모의고사 생성
- 모바일 대응 CBT 풀이 화면
- 자동 채점
- 과목별 점수 분석
- 합격/불합격/과락 판정
```

### 2차 고도화

```text
- 오답노트
- 취약 과목 집중 출제
- 미니 CBT
- 문제 중복 탐지
- Excel 업로드 고도화
- 문제 검수 워크플로우
- 응시 이력 대시보드
```

### 3차 고도화

```text
- PDF 문제 추출 보조
- 해설 기반 검색
- 태그별 학습
- 학습 리포트 PDF 출력
- 다중 사용자 계정
- 관리자/학습자 권한 분리
```

---

## 14. Antigravity 개발 요청 프롬프트

```text
프로젝트명은 cbt-repository-platform 입니다.

이 프로젝트는 특정 자격시험 하나에 고정된 CBT 앱이 아니라, 사용자가 보유한 문제 데이터를 업로드하여 자격시험별 CBT 저장소를 생성하고 운영할 수 있는 확장형 CBT Repository Platform입니다.

초기 검증 대상은 산업보안관리사입니다.
다만 향후 정보보안기사, 정보처리기사, 정보통신기사 등 다양한 보안·IT 자격시험으로 확장할 수 있어야 합니다.

핵심 요구사항은 다음과 같습니다.

1. CBT Repository 개념
- 관리자는 플랫폼 안에서 CBT 저장소를 생성할 수 있어야 합니다.
- 각 저장소는 독립적인 시험 기준, 과목 구조, 문제은행, 응시 이력, 분석 결과를 가집니다.
- 저장소 예시는 산업보안관리사, 정보보안기사, 정보처리기사, 정보통신기사입니다.

2. 하드코딩 금지
- 과목명, 과목 수, 과목별 문항 수, 총 문항 수, 제한 시간, 합격 기준, 과락 기준은 코드에 하드코딩하지 않습니다.
- 모든 시험 기준은 저장소 생성 또는 설정 화면에서 관리자가 입력합니다.

3. 초기 산업보안관리사 설정
- 총 125문항
- 제한 시간 120분
- 객관식 4지 택일형
- 5과목
  - 관리적보안
  - 물리적보안
  - 기술적보안
  - 보안사고대응
  - 보안지식경영
- 과목별 25문항
- 평균 70점 이상 합격
- 단일 과목 40점 미만 과락

4. 문제 업로드
- CSV/Excel 업로드를 우선 구현합니다.
- 필수 컬럼은 과목명, 문제, 보기1, 보기2, 보기3, 보기4, 정답, 해설, 난이도, 출처, 태그입니다.
- 업로드된 문제는 DB에 저장하고 저장소 및 과목과 매핑합니다.
- PDF 문제 추출은 후속 고도화로 고려하되, 구조적으로 확장 가능하게 설계합니다.

5. 시험 응시 기능
- 실전 모의고사
- 과목별 풀이
- 미니 CBT
- 오답 복습
- 취약 과목 집중 모드를 고려합니다.
- MVP에서는 실전 모의고사, 과목별 풀이, 자동 채점을 우선 구현합니다.

6. 채점 기능
- 저장소별 시험 기준에 따라 채점합니다.
- 과목별 점수, 전체 평균, 합격 여부, 과락 여부를 계산합니다.
- 과락 기준이 활성화된 저장소에서는 과목별 과락 여부를 판정합니다.

7. 모바일 UX
- 모바일에서는 한 화면에 한 문제만 표시합니다.
- 선택지는 카드형 터치 버튼으로 구성합니다.
- 상단에는 시험명, 남은 시간, 현재 문제 번호를 고정합니다.
- 하단에는 이전 문제, 문제 목록, 다음 문제 버튼을 고정합니다.
- 문제 목록은 바텀시트 형태로 제공합니다.
- 답안 선택 상태는 자동 저장합니다.

8. 기술 구조
- Frontend: React 또는 Next.js
- Styling: Tailwind CSS
- Backend: FastAPI
- Database: SQLite MVP, PostgreSQL 확장 가능
- API 기반 구조
- Clean Architecture와 확장 가능한 도메인 구조를 고려합니다.

우선 MVP 기준으로 폴더 구조, 데이터베이스 스키마, API 설계, 화면 구성, 샘플 CSV, 기본 UI 컴포넌트, README 초안을 작성해 주세요.
```

---

## 15. 최종 포트폴리오 문구

```text
CBT Repository Platform은 산업보안관리사를 초기 검증 대상으로 삼아, 사용자가 보유한 문제 데이터를 자격시험별 CBT 저장소로 전환하고, 실전 응시·자동 채점·과락 판정·취약 과목 복습을 지원하는 확장형 문제은행 플랫폼입니다.
```

포트폴리오 제목:

```text
자격시험 CBT 저장소 생성·운영 플랫폼
```

영문 제목:

```text
CBT Repository Platform
```

한 줄 소개:

```text
산업보안관리사부터 정보보안기사, 정보처리기사, 정보통신기사까지 확장 가능한 문제은행 기반 CBT 저장소 플랫폼
```
