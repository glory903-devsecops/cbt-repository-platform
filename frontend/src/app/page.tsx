"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Repository } from "@/lib/api";

export default function HomePage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.repositories.list()
      .then(setRepos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">CBT 저장소 목록</h1>
          <p className="text-gray-400 mt-1">자격시험별 문제은행을 관리합니다.</p>
        </div>
        <Link
          href="/repositories/new"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
        >
          + 새 저장소 만들기
        </Link>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-gray-800 rounded w-1/2 mb-3" />
              <div className="h-4 bg-gray-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-6 text-center">
          <p className="text-red-400 font-semibold">백엔드 서버에 연결할 수 없습니다.</p>
          <p className="text-gray-400 text-sm mt-1">{error}</p>
          <p className="text-gray-500 text-xs mt-2">backend/ 폴더에서 <code className="bg-gray-800 px-1 rounded">uvicorn main:app --reload</code>를 실행해주세요.</p>
        </div>
      )}

      {!loading && !error && repos.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-400 text-lg">아직 CBT 저장소가 없습니다.</p>
          <Link
            href="/repositories/new"
            className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            첫 번째 저장소 만들기
          </Link>
        </div>
      )}

      {!loading && repos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map((repo) => (
            <Link key={repo.id} href={`/repositories/${repo.id}`}>
              <div className="bg-gray-900 border border-gray-800 hover:border-indigo-600 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-900/20 group">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">📁</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${repo.is_active ? "bg-emerald-900/50 text-emerald-400" : "bg-gray-800 text-gray-500"}`}>
                    {repo.is_active ? "운영중" : "비활성"}
                  </span>
                </div>
                <h2 className="text-white font-bold text-lg group-hover:text-indigo-400 transition-colors">{repo.name}</h2>
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">{repo.description || "설명 없음"}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-800 rounded-lg py-1.5">
                    <div className="text-indigo-400 font-bold text-sm">{repo.total_questions}</div>
                    <div className="text-gray-500 text-xs">총 문항</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg py-1.5">
                    <div className="text-indigo-400 font-bold text-sm">{repo.time_limit_minutes}분</div>
                    <div className="text-gray-500 text-xs">제한 시간</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg py-1.5">
                    <div className="text-indigo-400 font-bold text-sm">{repo.passing_score}점</div>
                    <div className="text-gray-500 text-xs">합격 기준</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
