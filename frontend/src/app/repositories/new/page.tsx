"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const INIT_SUBJECTS = [
  { name: "관리적보안", question_count: 25 },
  { name: "물리적보안", question_count: 25 },
  { name: "기술적보안", question_count: 25 },
  { name: "보안사고대응", question_count: 25 },
  { name: "보안지식경영", question_count: 25 },
];

export default function NewRepositoryPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    total_questions: 125,
    time_limit_minutes: 120,
    passing_score: 70,
    fail_threshold_score: 40,
    is_subject_fail_enabled: true,
    option_count: 4,
    randomize_questions: false,
    randomize_options: false,
  });
  const [subjects, setSubjects] = useState(INIT_SUBJECTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("저장소명을 입력해주세요."); return; }
    setLoading(true);
    setError("");
    try {
      const repo = await api.repositories.create(form);
      for (let i = 0; i < subjects.length; i++) {
        const s = subjects[i];
        if (s.name.trim()) {
          await api.subjects.create(repo.id, { ...s, description: "", order_index: i });
        }
      }
      router.push(`/repositories/${repo.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">CBT 저장소 생성</h1>
      <p className="text-gray-400 mb-8">새로운 자격시험 CBT 저장소를 만듭니다.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-lg">📋 기본 정보</h2>
          <div>
            <label className="text-gray-400 text-sm">저장소명 *</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="예: 산업보안관리사"
              className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm">설명</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="저장소에 대한 설명을 입력하세요."
              rows={2}
              className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm">카테고리</label>
            <input
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="예: 보안자격증"
              className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* 시험 기준 */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-lg">⚙️ 시험 기준</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm">총 문항 수</label>
              <input type="number" value={form.total_questions} onChange={(e) => set("total_questions", +e.target.value)}
                className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-gray-400 text-sm">제한 시간 (분)</label>
              <input type="number" value={form.time_limit_minutes} onChange={(e) => set("time_limit_minutes", +e.target.value)}
                className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-gray-400 text-sm">합격 기준 점수</label>
              <input type="number" value={form.passing_score} onChange={(e) => set("passing_score", +e.target.value)}
                className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-gray-400 text-sm">과락 기준 점수</label>
              <input type="number" value={form.fail_threshold_score} onChange={(e) => set("fail_threshold_score", +e.target.value)}
                className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="subject_fail" checked={form.is_subject_fail_enabled}
              onChange={(e) => set("is_subject_fail_enabled", e.target.checked)}
              className="w-4 h-4 accent-indigo-500" />
            <label htmlFor="subject_fail" className="text-gray-300 text-sm">과목별 과락 기준 적용</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="randomize" checked={form.randomize_questions}
              onChange={(e) => set("randomize_questions", e.target.checked)}
              className="w-4 h-4 accent-indigo-500" />
            <label htmlFor="randomize" className="text-gray-300 text-sm">문제 순서 랜덤 출제</label>
          </div>
        </div>

        {/* 과목 설정 */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-lg">📚 과목 설정</h2>
            <button type="button"
              onClick={() => setSubjects((p) => [...p, { name: "", question_count: 0 }])}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
              + 과목 추가
            </button>
          </div>
          {subjects.map((s, i) => (
            <div key={i} className="flex gap-3 items-center">
              <input value={s.name} onChange={(e) => setSubjects((p) => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                placeholder={`과목명 ${i + 1}`}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500" />
              <input type="number" value={s.question_count}
                onChange={(e) => setSubjects((p) => p.map((x, j) => j === i ? { ...x, question_count: +e.target.value } : x))}
                placeholder="문항 수"
                className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" />
              <button type="button" onClick={() => setSubjects((p) => p.filter((_, j) => j !== i))}
                className="text-red-500 hover:text-red-400 text-lg">✕</button>
            </div>
          ))}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 text-white py-3 rounded-xl font-bold text-lg transition-colors">
            {loading ? "생성 중..." : "✅ 저장소 생성"}
          </button>
          <button type="button" onClick={() => router.push("/")}
            className="px-6 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-semibold transition-colors">
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
