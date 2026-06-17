"use client";

import { useMemo, useState } from "react";
import { Search, ExternalLink, FileCode2, Lock } from "lucide-react";
import type { StaticPage, StaticPageCategory } from "@/lib/static-pages";

const CATEGORY_TONE: Record<StaticPageCategory, string> = {
  "메인": "bg-pink-50 text-pink-600",
  "마케팅 랜딩": "bg-amber-50 text-amber-700",
  "강의": "bg-purple-50 text-purple-600",
  "커뮤니티": "bg-blue-50 text-blue-600",
  "인증": "bg-emerald-50 text-emerald-600",
  "결제": "bg-cyan-50 text-cyan-700",
  "법적·정책": "bg-neutral-100 text-neutral-700",
  "기타": "bg-neutral-100 text-neutral-500",
};

export function StaticPagesList({ pages }: { pages: StaticPage[] }) {
  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState<StaticPageCategory | "전체">("전체");

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const out: StaticPageCategory[] = [];
    for (const p of pages) {
      if (!seen.has(p.category)) {
        seen.add(p.category);
        out.push(p.category);
      }
    }
    return out;
  }, [pages]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return pages.filter((p) => {
      if (activeCat !== "전체" && p.category !== activeCat) return false;
      if (ql) {
        const hay = `${p.title} ${p.path} ${p.desc}`.toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
  }, [pages, q, activeCat]);

  return (
    <div>
      {/* 검색·필터 */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="제목·경로·설명으로 검색"
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCat("전체")}
            className={
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors " +
              (activeCat === "전체" ? "ig-gradient text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200")
            }
          >
            전체
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCat(c)}
              className={
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors " +
                (activeCat === c ? "ig-gradient text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200")
              }
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 그리드 */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-100 p-10 text-center text-sm text-neutral-400">
          조건에 맞는 페이지가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((p) => {
            const linkPath = p.examplePath ?? p.path;
            const isDynamic = p.path.includes("[");
            return (
              <div
                key={p.path}
                className="bg-white rounded-2xl border border-neutral-100 p-5 hover:border-pink-200 transition-colors flex flex-col"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full " + CATEGORY_TONE[p.category]}>
                    {p.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400 font-semibold">
                    <Lock className="w-3 h-3" /> 코드
                  </span>
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-1">{p.title}</h3>
                <p className="text-xs text-neutral-500 mb-3 line-clamp-2">{p.desc}</p>
                <code className="block text-xs font-mono text-neutral-700 bg-neutral-50 border border-neutral-100 rounded-md px-2.5 py-1.5 mb-3 truncate">
                  {p.path}
                </code>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-4">
                  <FileCode2 className="w-3 h-3" />
                  <span className="truncate font-mono">{p.source}</span>
                </div>
                <div className="mt-auto flex gap-2">
                  <a
                    href={linkPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:border-pink-300 hover:text-pink-500"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {isDynamic ? "예시 보기" : "새 탭에서 열기"}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
