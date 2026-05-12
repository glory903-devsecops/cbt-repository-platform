"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, Repository, Subject, Question } from "@/lib/api";

export default function RepositoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const repoId = Number(id);

  const [repo, setRepo] = useState<Repository | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tab, setTab] = useState<"overview" | "questions" | "upload">("overview");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [r, s, q] = await Promise.all([
        api.repositories.get(repoId),
        api.subjects.list(repoId),
        api.questions.list(repoId),
      ]);
      setRepo(r); setSubjects(s); setQuestions(q);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [repoId]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setUploadMsg("");
    try {
      const r = await api.questions.upload(repoId, file);
      setUploadMsg(`✅ ${r.message}`);
      await load();
    } catch (e: unknown) {
      setUploadMsg(`❌ ${e instanceof Error ? e.message : "업로드 실패"}`);
    } finally { setUploading(false); }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">불러오는 중...</div>;
  if (!repo) return <div className="text-center py-20 text-red-400">저장소를 찾을 수 없습니다.</div>;

  const subjectMap = Object.fromEntries(subjects.map((s) => [s.id, s.name]));

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-gray-500 text-sm mb-1"><Link href="/" className="hover:text-gray-300">저장소 목록</Link> / {repo.name}</p>
          <h1 className="text-3xl font-bold text-white">{repo.name}</h1>
          <p className="text-gray-400 mt-1">{repo.description}</p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={() => router.push(`/repositories/${repoId}/exam`)}
            disabled={questions.length === 0}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold transition-colors"
          >
            🎯 시험 시작
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "총 문항 수", val: `${repo.total_questions}문항` },
          { label: "제한 시간", val: `${repo.time_limit_minutes}분` },
          { label: "합격 기준", val: `${repo.passing_score}점` },
          { label: "등록 문제", val: `${questions.length}문항` },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-indigo-400 font-bold text-xl">{s.val}</div>
            <div className="text-gray-500 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800">
        {(["overview", "questions", "upload"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${tab === t ? "border-indigo-500 text-indigo-400" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
            {t === "overview" ? "📋 과목 현황" : t === "questions" ? "📝 문제 목록" : "⬆️ 문제 업로드"}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-3">
          {subjects.length === 0 && <p className="text-gray-500 text-center py-10">등록된 과목이 없습니다.</p>}
          {subjects.map((s) => {
            const cnt = questions.filter((q) => q.subject_id === s.id).length;
            const pct = s.question_count > 0 ? Math.min(100, Math.round(cnt / s.question_count * 100)) : 0;
            return (
              <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">{s.name}</span>
                  <span className="text-gray-400 text-sm">{cnt} / {s.question_count} 문항</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Questions */}
      {tab === "questions" && (
        <div className="space-y-2">
          {questions.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-3">등록된 문제가 없습니다.</p>
              <button onClick={() => setTab("upload")} className="text-indigo-400 hover:text-indigo-300 text-sm underline">문제 업로드하기</button>
            </div>
          )}
          {questions.slice(0, 50).map((q, i) => (
            <div key={q.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-indigo-400 font-mono text-sm font-bold mt-0.5 flex-shrink-0">Q{i + 1}</span>
                <div className="flex-1">
                  <p className="text-white text-sm leading-relaxed">{q.question_text}</p>
                  <div className="flex gap-3 mt-2 text-xs text-gray-500">
                    <span>📂 {subjectMap[q.subject_id] || "-"}</span>
                    <span>⭐ {q.difficulty}</span>
                    <span className="text-emerald-400">정답: {q.correct_answer}번</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {questions.length > 50 && <p className="text-gray-500 text-sm text-center py-2">총 {questions.length}문항 중 50문항 표시</p>}
        </div>
      )}

      {/* Upload */}
      {tab === "upload" && (
        <div className="max-w-lg">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h3 className="text-white font-semibold">CSV / Excel 파일 업로드</h3>
            <div className="bg-gray-800 rounded-lg p-4 text-xs text-gray-400 space-y-1 font-mono">
              <p className="text-gray-300 font-semibold mb-2">필수 컬럼:</p>
              <p>subject_name, question_text, option_1, option_2,</p>
              <p>option_3, option_4, correct_answer (1~4)</p>
              <p className="text-gray-300 font-semibold mt-2 mb-1">권장 컬럼:</p>
              <p>explanation, difficulty, source, tags, chapter, year</p>
            </div>
            <div
              className="border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-xl p-8 text-center cursor-pointer transition-colors"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input id="file-input" type="file" accept=".csv,.xlsx,.xls" className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              <div className="text-3xl mb-2">📄</div>
              {file ? (
                <p className="text-indigo-400 font-semibold">{file.name}</p>
              ) : (
                <p className="text-gray-400">CSV 또는 Excel 파일을 선택하세요</p>
              )}
            </div>
            {uploadMsg && (
              <p className={`text-sm ${uploadMsg.startsWith("✅") ? "text-emerald-400" : "text-red-400"}`}>{uploadMsg}</p>
            )}
            <button onClick={handleUpload} disabled={!file || uploading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 text-white py-3 rounded-xl font-bold transition-colors">
              {uploading ? "업로드 중..." : "업로드"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <a href="/sample/questions_sample.csv" download className="text-indigo-400 hover:text-indigo-300 text-sm underline">
              📥 샘플 CSV 다운로드
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
