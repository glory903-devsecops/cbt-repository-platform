const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json();
}

// ── Types ──────────────────────────────────────────────────────────────────
export interface Repository {
  id: number;
  name: string;
  description: string;
  category: string;
  total_questions: number;
  time_limit_minutes: number;
  passing_score: number;
  fail_threshold_score: number;
  is_subject_fail_enabled: boolean;
  option_count: number;
  randomize_questions: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Subject {
  id: number;
  repository_id: number;
  name: string;
  description: string;
  question_count: number;
  order_index: number;
  is_active: boolean;
}

export interface Question {
  id: number;
  repository_id: number;
  subject_id: number;
  question_text: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  correct_answer: number;
  explanation: string;
  difficulty: string;
  is_active: boolean;
}

export interface ExamQuestion {
  order_index: number;
  question_id: number;
  subject_id: number;
  question_text: string;
  options: string[];
  selected_answer: number | null;
  marked_for_review: boolean;
}

export interface ExamSession {
  session_id: number;
  time_limit_minutes: number;
  questions: ExamQuestion[];
}

export interface SubjectScore {
  subject_id: number;
  subject_name: string;
  correct_count: number;
  total_count: number;
  score: number;
  is_failed_subject: boolean;
}

export interface ExamResult {
  session_id: number;
  repository_name: string;
  mode: string;
  total_score: number;
  average_score: number;
  pass_status: "pass" | "fail" | "fail_subject";
  fail_reason: string | null;
  subject_scores: SubjectScore[];
  total_questions: number;
  correct_count: number;
}

// ── API Functions ───────────────────────────────────────────────────────────
export const api = {
  repositories: {
    list: () => req<Repository[]>("/api/repositories"),
    get: (id: number) => req<Repository>(`/api/repositories/${id}`),
    create: (data: Omit<Repository, "id" | "created_at" | "is_active">) =>
      req<Repository>("/api/repositories", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Repository>) =>
      req<Repository>(`/api/repositories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) =>
      fetch(`${BASE}/api/repositories/${id}`, { method: "DELETE" }),
  },

  subjects: {
    list: (repoId: number) => req<Subject[]>(`/api/repositories/${repoId}/subjects`),
    create: (repoId: number, data: Omit<Subject, "id" | "repository_id" | "is_active">) =>
      req<Subject>(`/api/repositories/${repoId}/subjects`, { method: "POST", body: JSON.stringify(data) }),
    update: (subjectId: number, data: Partial<Subject>) =>
      req<Subject>(`/api/repositories/subjects/${subjectId}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (subjectId: number) =>
      fetch(`${BASE}/api/repositories/subjects/${subjectId}`, { method: "DELETE" }),
  },

  questions: {
    list: (repoId: number, subjectId?: number) =>
      req<Question[]>(`/api/repositories/${repoId}/questions${subjectId ? `?subject_id=${subjectId}` : ""}`),
    upload: async (repoId: number, file: File) => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${BASE}/api/repositories/${repoId}/questions/upload`, { method: "POST", body: form });
      if (!res.ok) throw new Error((await res.json()).detail);
      return res.json();
    },
  },

  exam: {
    create: (repoId: number, mode: string, subjectId?: number) =>
      req<ExamSession>(`/api/repositories/${repoId}/exam-sessions`, {
        method: "POST",
        body: JSON.stringify({ mode, subject_id: subjectId ?? null }),
      }),
    submit: (sessionId: number, answers: { question_id: number; selected_answer: number | null; marked_for_review: boolean }[]) =>
      req<ExamResult>(`/api/exam-sessions/${sessionId}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      }),
    result: (sessionId: number) => req<ExamResult>(`/api/exam-sessions/${sessionId}/result`),
  },
};
