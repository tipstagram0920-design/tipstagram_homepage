"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Search, ExternalLink, Play } from "lucide-react";

const CATEGORIES = ["비즈니스재테크", "라이프스타일", "전문직교육", "푸드", "여행", "취미창작"];

interface Reel {
  id: string;
  reel_url: string;
  thumbnail_url: string | null;
  view_count: number | null;
  username: string | null;
  claude_summary: string | null;
  category_main: string | null;
}

function fmtViews(n: number | null) {
  if (!n) return "";
  if (n >= 10000) return `${Math.round(n / 10000)}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}천`;
  return String(n);
}

export function ReelspyPanel({ seedKeyword }: { seedKeyword: string }) {
  const [q, setQ] = useState(seedKeyword);
  const [category, setCategory] = useState("");
  const [items, setItems] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [searched, setSearched] = useState(false);

  const run = useCallback(async (query: string, cat: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (cat) params.set("category", cat);
      params.set("limit", "12");
      const res = await fetch(`/api/admin/reelspy/search?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      setConfigured(data.configured !== false);
      setItems(Array.isArray(data.items) ? data.items : []);
    } finally {
      setLoading(false);
    }
  }, []);

  // 열릴 때 seed 키워드로 자동 검색
  useEffect(() => {
    setQ(seedKeyword);
    run(seedKeyword, "");
  }, [seedKeyword, run]);

  return (
    <div className="mt-5 border-t border-neutral-200 pt-4">
      <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-2">
        릴스파이 참고 릴스
      </p>

      {/* 검색 */}
      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run(q, category)}
            placeholder="키워드 (예: 다이어트, 공부법)"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
        </div>
        <button
          onClick={() => run(q, category)}
          disabled={loading}
          className="px-3 py-2 rounded-lg bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "검색"}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => {
              const next = category === c ? "" : c;
              setCategory(next);
              run(q, next);
            }}
            className={
              "text-[11px] px-2 py-1 rounded-full border transition " +
              (category === c
                ? "border-pink-400 bg-pink-100 text-pink-700 font-bold"
                : "border-neutral-200 text-neutral-600 hover:border-neutral-300")
            }
          >
            {c}
          </button>
        ))}
      </div>

      {/* 결과 */}
      {!configured ? (
        <p className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          릴스파이 연동이 아직 설정되지 않았어요. (REELSPY_SUPABASE_URL / SERVICE_ROLE_KEY 필요)
        </p>
      ) : loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-neutral-300" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-[12px] text-neutral-400 py-4 text-center">
          {searched ? "검색 결과가 없어요. 다른 키워드로 찾아보세요." : "키워드로 참고 릴스를 검색하세요."}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {items.map((r) => (
            <a
              key={r.id}
              href={r.reel_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 relative aspect-[9/16]"
              title={r.claude_summary || r.reel_url}
            >
              {r.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/admin/reelspy/thumb?url=${encodeURIComponent(r.thumbnail_url)}`}
                  alt={r.username || "reel"}
                  className="w-full h-full object-cover group-hover:opacity-90"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                  <Play className="w-6 h-6" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                <p className="text-[10px] text-white font-semibold truncate">@{r.username}</p>
                <p className="text-[9px] text-white/80">조회 {fmtViews(r.view_count)}</p>
              </div>
              <span className="absolute top-1 right-1 text-white/90">
                <ExternalLink className="w-3 h-3" />
              </span>
            </a>
          ))}
        </div>
      )}
      <p className="text-[10px] text-neutral-400 mt-2">
        썸네일 클릭 → 인스타 릴스 원본. 학생에게 추천할 만한 걸 골라 피드백에 참고하세요.
      </p>
    </div>
  );
}
