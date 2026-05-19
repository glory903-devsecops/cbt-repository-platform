"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api, ExamSession, ExamQuestion, Repository, Subject } from "@/lib/api";

const MODE_LABELS: Record<string, string> = { full: "실전 모의고사", subject: "과목별 풀이", review: "오답 복습" };

export default function ExamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const repoId = Number(id);
  
  const initMode = searchParams.get("mode") || "full";
  const baseSessionId = searchParams.get("base") ? Number(searchParams.get("base")) : undefined;

  const [repo, setRepo] = useState<Repository | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [mode, setMode] = useState<"select" | "exam" | "submitting">("select");
  const [examMode, setExamMode] = useState(initMode);
  const [selSubject, setSelSubject] = useState<number | undefined>();
  const [session, setSession] = useState<ExamSession | null>(null);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    Promise.all([api.repositories.get(repoId), api.subjects.list(repoId)]).then(([r, s]) => {
      setRepo(r); setSubjects(s);
    });
  }, [repoId]);

  // 타이머
  useEffect(() => {
    if (mode !== "exam" || !session) return;
    setTimeLeft(session.time_limit_minutes * 60);
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [mode, session]);

  const startExam = async () => {
    try {
      const s = await api.exam.create(repoId, examMode, selSubject, baseSessionId);
      setSession(s);
      const init: Record<number, null> = {};
      s.questions.forEach((q) => { init[q.question_id] = null; });
      setAnswers(init);
      setCurrent(0);
      setMode("exam");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "시험 시작 오류");
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!session) return;
    setMode("submitting");
    try {
      const payload = session.questions.map((q) => ({
        question_id: q.question_id,
        selected_answer: answers[q.question_id] ?? null,
        marked_for_review: marked.has(q.question_id),
      }));
      await api.exam.submit(session.session_id, payload);
      router.push(`/exam-sessions/${session.session_id}/result`);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "제출 오류");
      setMode("exam");
    }
  }, [session, answers, marked, router]);

  const fmt = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

  // ── 모드 선택 화면 ───────────────────────────────────────────────────────
  if (mode === "select") {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-1">{repo?.name}</h1>
        <p className="text-gray-400 text-sm mb-8">응시 모드를 선택하세요.</p>
        <div className="space-y-3 mb-6">
          {[
            { val: "full", label: "🎯 실전 모의고사", desc: "전체 문항 실전 출제" },
            { val: "subject", label: "📚 과목별 풀이", desc: "선택한 과목만 집중 학습" },
            ...(baseSessionId ? [{ val: "review", label: "♻️ 오답 복습", desc: "이전 시험에서 틀린 문제 다시 풀기" }] : []),
          ].map((m) => (
            <button key={m.val} onClick={() => { setExamMode(m.val); if (m.val !== "subject") setSelSubject(undefined); }}
              className={`w-full text-left p-4 rounded-xl border transition-all ${examMode === m.val ? "border-indigo-500 bg-indigo-900/20" : "border-gray-800 bg-gray-900 hover:border-gray-600"}`}>
              <div className="font-semibold text-white">{m.label}</div>
              <div className="text-gray-400 text-sm mt-0.5">{m.desc}</div>
            </button>
          ))}
        </div>
        {examMode === "subject" && subjects.length > 0 && (
          <div className="mb-6 space-y-2">
            <p className="text-gray-400 text-sm">과목 선택:</p>
            {subjects.map((s) => (
              <button key={s.id} onClick={() => setSelSubject(s.id)}
                className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${selSubject === s.id ? "border-indigo-500 bg-indigo-900/20 text-white" : "border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-600"}`}>
                {s.name} ({s.question_count}문항)
              </button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => router.push(`/repositories/${repoId}`)}
            className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition-colors">
            돌아가기
          </button>
          <button onClick={startExam}
            disabled={examMode === "subject" && !selSubject}
            className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 text-white font-bold transition-colors">
            시작하기
          </button>
        </div>
      </div>
    );
  }

  if (mode === "submitting") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-4xl animate-spin">⏳</div>
        <p className="text-gray-400">채점 중입니다...</p>
      </div>
    );
  }

  // ── CBT 응시 화면 (Mobile-first) ──────────────────────────────────────────
  if (!session) return null;
  const q: ExamQuestion = session.questions[current];
  const totalQ = session.questions.length;
  const answeredCount = Object.values(answers).filter((v) => v !== null).length;
  const isMarked = marked.has(q.question_id);
  const selectedAns = answers[q.question_id];
  const timeWarning = timeLeft < 300;

  const selectAnswer = (opt: number) => {
    setAnswers((p) => ({ ...p, [q.question_id]: opt }));
  };

  const toggleMark = () => {
    setMarked((p) => {
      const next = new Set(p);
      next.has(q.question_id) ? next.delete(q.question_id) : next.add(q.question_id);
      return next;
    });
  };

  const getStatus = (qid: number) => {
    if (marked.has(qid)) return "marked";
    if (answers[qid] !== null && answers[qid] !== undefined) return "answered";
    return "unanswered";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      {/* 상단 고정 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">{repo?.name} · {MODE_LABELS[examMode]}</p>
            <p className="text-white font-semibold text-sm">{current + 1} / {totalQ} 문항</p>
          </div>
          <div className={`text-xl font-mono font-bold tabular-nums ${timeWarning ? "text-red-400 animate-pulse" : "text-indigo-400"}`}>
            {fmt(timeLeft)}
          </div>
          <button onClick={() => {
            if (confirm(`${answeredCount}/${totalQ}문항 완료. 제출하시겠습니까?`)) handleSubmit();
          }} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors">
            제출
          </button>
        </div>
        {/* 진행 바 */}
        <div className="max-w-2xl mx-auto mt-2">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(answeredCount / totalQ) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="flex-1 pt-28 pb-28 px-4 max-w-2xl mx-auto w-full">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
            {subjects.find((s) => s.id === q.subject_id)?.name ?? ""}
          </span>
          <button onClick={toggleMark}
            className={`text-xs px-2 py-1 rounded transition-colors ${isMarked ? "bg-yellow-900/50 text-yellow-400" : "bg-gray-800 text-gray-500 hover:text-yellow-400"}`}>
            {isMarked ? "⭐ 다시보기" : "☆ 다시보기"}
          </button>
        </div>

        {/* 문제 지문 */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-5">
          <p className="text-white text-base leading-relaxed whitespace-pre-wrap">{q.question_text}</p>
        </div>

        {/* 보기 — 카드형 터치 버튼 */}
        <div className="space-y-3">
          {q.options.map((opt, i) => {
            const optNum = i + 1;
            const isSelected = selectedAns === optNum;
            return (
              <button key={i} onClick={() => selectAnswer(optNum)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-900/30 text-white"
                    : "border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-600 hover:bg-gray-800"
                }`}>
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                    isSelected ? "bg-indigo-500 text-white" : "bg-gray-800 text-gray-400"
                  }`}>
                    {optNum}
                  </span>
                  <span className="leading-relaxed pt-0.5">{opt}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 하단 고정 내비게이션 */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}
            className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-300 font-semibold transition-colors">
            ← 이전
          </button>
          <button onClick={() => setShowList(true)}
            className="px-5 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors text-sm">
            📋 목록
          </button>
          <button onClick={() => setCurrent((c) => Math.min(totalQ - 1, c + 1))} disabled={current === totalQ - 1}
            className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-300 font-semibold transition-colors">
            다음 →
          </button>
        </div>
      </div>

      {/* 문제 목록 바텀시트 */}
      {showList && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowList(false)} />
          <div className="relative bg-gray-900 border-t border-gray-700 rounded-t-3xl p-5 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">문제 목록</h3>
              <button onClick={() => setShowList(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            <div className="flex gap-3 text-xs mb-4 flex-wrap">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-700 inline-block" /> 미풀이</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" /> 풀이 완료</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> 다시보기</span>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {session.questions.map((sq, i) => {
                const st = getStatus(sq.question_id);
                return (
                  <button key={sq.question_id} onClick={() => { setCurrent(i); setShowList(false); }}
                    className={`aspect-square rounded-lg text-sm font-bold transition-all ${
                      i === current ? "ring-2 ring-white" : ""
                    } ${
                      st === "marked" ? "bg-yellow-600 text-white" :
                      st === "answered" ? "bg-indigo-600 text-white" :
                      "bg-gray-800 text-gray-400"
                    }`}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
