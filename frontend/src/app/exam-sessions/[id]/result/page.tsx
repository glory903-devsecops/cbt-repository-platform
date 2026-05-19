"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ExamResult } from "@/lib/api";

const STATUS_INFO = {
  pass:         { emoji: "🎉", label: "합격", color: "text-emerald-400", bg: "bg-emerald-900/20 border-emerald-700" },
  fail:         { emoji: "😔", label: "불합격", color: "text-red-400",    bg: "bg-red-900/20 border-red-700" },
  fail_subject: { emoji: "⚠️", label: "과락 불합격", color: "text-yellow-400", bg: "bg-yellow-900/20 border-yellow-700" },
};

export default function ResultPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const router = useRouter();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.exam.result(Number(sessionId))
      .then((res) => {
        setResult(res);
        // Save to localStorage
        const historyStr = localStorage.getItem("cbt_exam_history");
        let historyIds: number[] = [];
        if (historyStr) {
          try { historyIds = JSON.parse(historyStr); } catch (e) {}
        }
        if (!historyIds.includes(res.session_id)) {
          historyIds.push(res.session_id);
          localStorage.setItem("cbt_exam_history", JSON.stringify(historyIds));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-400">결과를 불러오는 중...</p>
    </div>
  );

  if (!result) return (
    <div className="text-center py-20 text-red-400">결과를 찾을 수 없습니다.</div>
  );

  const info = STATUS_INFO[result.pass_status] ?? STATUS_INFO.fail;
  const correctPct = result.total_questions > 0
    ? Math.round(result.correct_count / result.total_questions * 100)
    : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* 결과 상태 카드 */}
      <div className={`border rounded-2xl p-8 text-center mb-8 ${info.bg}`}>
        <div className="text-6xl mb-3">{info.emoji}</div>
        <div className={`text-3xl font-extrabold ${info.color}`}>{info.label}</div>
        <div className="text-gray-400 text-sm mt-2">{result.repository_name}</div>
        {result.fail_reason && (
          <div className="mt-3 text-sm text-gray-300 bg-black/20 rounded-lg px-4 py-2 inline-block">
            {result.fail_reason}
          </div>
        )}
      </div>

      {/* 점수 요약 */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-400">{result.average_score.toFixed(1)}</div>
          <div className="text-gray-500 text-xs mt-1">평균 점수</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-400">{result.correct_count}</div>
          <div className="text-gray-500 text-xs mt-1">정답 수 / {result.total_questions}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-400">{correctPct}%</div>
          <div className="text-gray-500 text-xs mt-1">정답률</div>
        </div>
      </div>

      {/* 과목별 점수 */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-bold text-lg mb-4">📊 과목별 점수</h2>
        <div className="space-y-4">
          {result.subject_scores.map((s) => (
            <div key={s.subject_id}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">{s.subject_name}</span>
                  {s.is_failed_subject && (
                    <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full">과락</span>
                  )}
                </div>
                <div className="text-right">
                  <span className={`font-bold ${s.is_failed_subject ? "text-red-400" : s.score >= 70 ? "text-emerald-400" : "text-yellow-400"}`}>
                    {s.score.toFixed(1)}점
                  </span>
                  <span className="text-gray-500 text-xs ml-2">{s.correct_count}/{s.total_count}</span>
                </div>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${s.is_failed_subject ? "bg-red-500" : s.score >= 70 ? "bg-emerald-500" : "bg-yellow-500"}`}
                  style={{ width: `${s.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 취약 과목 추천 */}
      {result.subject_scores.some((s) => s.score < 70) && (
        <div className="bg-amber-900/10 border border-amber-800/50 rounded-2xl p-5 mb-6">
          <h3 className="text-amber-400 font-bold mb-3">💡 복습 추천 과목</h3>
          <div className="space-y-2">
            {result.subject_scores
              .filter((s) => s.score < 70)
              .sort((a, b) => a.score - b.score)
              .map((s) => (
                <div key={s.subject_id} className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">{s.subject_name}</span>
                  <span className="text-amber-400 font-semibold text-sm">{s.score.toFixed(1)}점</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => router.back()}
          className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition-colors"
        >
          다시 시험 보기
        </button>
        <button
          onClick={() => router.push("/")}
          className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors"
        >
          저장소 목록
        </button>
      </div>
    </div>
  );
}
