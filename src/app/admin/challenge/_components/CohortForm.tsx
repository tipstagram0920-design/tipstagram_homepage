"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toKstLocalDateTime, kstLocalToUtcISO } from "@/lib/kst";

interface Initial {
  id?: string;
  productSlug?: string;
  name?: string;
  week1StartAtIso?: string;
  weeksTotal?: number;
  isActive?: boolean;
}

const DEFAULT_START =
  toKstLocalDateTime(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()).slice(0, 10) +
  "T09:00";

export function CohortForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [productSlug, setProductSlug] = useState(initial?.productSlug ?? "5-week-challenge");
  const [week1StartAt, setWeek1StartAt] = useState(
    initial?.week1StartAtIso ? toKstLocalDateTime(initial.week1StartAtIso) : DEFAULT_START
  );
  const [weeksTotal, setWeeksTotal] = useState(initial?.weeksTotal ?? 5);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setError("");
    if (!name.trim()) return setError("기수 이름을 입력해주세요. 예: 2026년 7월 기수");
    if (!week1StartAt) return setError("Week 1 오픈 시각을 선택해주세요.");
    setSaving(true);
    try {
      const url = initial?.id ? `/api/admin/challenge/${initial.id}` : "/api/admin/challenge";
      const method = initial?.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          productSlug,
          week1StartAt: kstLocalToUtcISO(week1StartAt),
          weeksTotal,
          isActive,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "저장 실패");
        return;
      }
      router.push(`/admin/challenge/${data.cohort.id}`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-5">
      <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">기수 이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="2026년 7월 기수"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
            대상 상품 (productSlug)
          </label>
          <select
            value={productSlug}
            onChange={(e) => setProductSlug(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          >
            <option value="5-week-challenge">5-week-challenge (195만원)</option>
            <option value="5-week-challenge-plus-consulting">
              5-week-challenge-plus-consulting (300만원)
            </option>
          </select>
          <p className="text-xs text-neutral-500 mt-1.5">
            이 상품의 유효 구매자가 이 기수의 참여자가 됩니다.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
            Week 1 오픈 시각 (KST)
          </label>
          <input
            type="datetime-local"
            value={week1StartAt}
            onChange={(e) => setWeek1StartAt(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
          <p className="text-xs text-neutral-500 mt-1.5">
            나머지 4개 주차는 이 시각에서 7일 간격으로 자동 생성됩니다. (숙제 마감은 각 주 오픈+6일 21:00)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5">주차 수</label>
            <input
              type="number"
              min={1}
              max={12}
              value={weeksTotal}
              onChange={(e) => setWeeksTotal(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5">상태</label>
            <button
              type="button"
              onClick={() => setIsActive((v) => !v)}
              className={
                "w-full px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors " +
                (isActive
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-neutral-200 bg-neutral-50 text-neutral-500")
              }
            >
              {isActive ? "활성" : "비활성"}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {initial?.id ? "저장" : "생성"}
          </button>
        </div>
      </div>
    </div>
  );
}
