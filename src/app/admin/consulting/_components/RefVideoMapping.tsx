"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Video } from "lucide-react";

interface LessonChoice {
  id: string;
  title: string;
  sectionTitle: string;
}
interface Category {
  guideKey: string;
  label: string;
}

export function RefVideoMapping({
  categories,
  lessons,
  initialMap,
}: {
  categories: Category[];
  lessons: LessonChoice[];
  initialMap: Record<string, string>;
}) {
  const router = useRouter();
  const [map, setMap] = useState<Record<string, string>>(initialMap);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // 섹션별로 그룹핑한 옵션
  const grouped: Record<string, LessonChoice[]> = {};
  for (const l of lessons) (grouped[l.sectionTitle] ??= []).push(l);

  const save = async () => {
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const clean = Object.fromEntries(Object.entries(map).filter(([, v]) => v));
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "consulting_ref_videos", value: JSON.stringify(clean) }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "저장 실패");
        return;
      }
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4 mt-6">
      <div>
        <h2 className="text-base font-bold text-neutral-800 inline-flex items-center gap-2">
          <Video className="w-4 h-4 text-pink-500" /> 숙제별 참고 영상
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          카테고리별로 <strong>marketing-booster</strong> 강의를 하나씩 지정하면, 컨설팅 고객의 해당 숙제 카드에 참고 영상으로 보여요.
          (컨설팅 등록자에겐 이 강의가 자동으로 열립니다.)
        </p>
      </div>

      {lessons.length === 0 ? (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          marketing-booster 강의가 아직 없어요. 교육과정 관리에서 강의를 먼저 등록해 주세요.
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {categories.map((c) => (
              <div key={c.guideKey} className="flex items-center gap-3 flex-wrap">
                <span className="w-36 shrink-0 text-sm font-semibold text-neutral-700">{c.label}</span>
                <select
                  value={map[c.guideKey] ?? ""}
                  onChange={(e) => setMap((m) => ({ ...m, [c.guideKey]: e.target.value }))}
                  className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400 bg-white"
                >
                  <option value="">— 연결 안 함 —</option>
                  {Object.entries(grouped).map(([section, ls]) => (
                    <optgroup key={section} label={section}>
                      {ls.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              저장
            </button>
            {saved && (
              <span className="text-sm text-green-600 inline-flex items-center gap-1.5">
                <Check className="w-4 h-4" /> 저장되었습니다.
              </span>
            )}
          </div>
        </>
      )}
    </section>
  );
}
