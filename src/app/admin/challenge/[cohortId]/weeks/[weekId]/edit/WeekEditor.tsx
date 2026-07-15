"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Plus, Trash2, Video } from "lucide-react";
import { toKstLocalDateTime, kstLocalToUtcISO } from "@/lib/kst";

interface Initial {
  id: string;
  title: string;
  description: string;
  homeworkPrompt: string;
  openAtIso: string;
  homeworkDueAtIso: string;
  liveAtIso: string | null;
  zoomUrl: string;
  recordingUrl: string;
  recommendedLessonIds: string[];
  externalVideos: ExternalVideoEntry[];
}

export interface ExternalVideoEntry {
  title: string;
  url: string;
  description?: string;
}
const EMPTY_VIDEO: ExternalVideoEntry = { title: "", url: "", description: "" };

interface LessonChoice {
  id: string;
  title: string;
  sectionTitle: string;
}

export function WeekEditor({
  initial,
  lessonChoices,
}: {
  initial: Initial;
  lessonChoices: LessonChoice[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [homeworkPrompt, setHomeworkPrompt] = useState(initial.homeworkPrompt);
  const [openAt, setOpenAt] = useState(toKstLocalDateTime(initial.openAtIso));
  const [homeworkDueAt, setHomeworkDueAt] = useState(toKstLocalDateTime(initial.homeworkDueAtIso));
  const [liveAt, setLiveAt] = useState(
    initial.liveAtIso ? toKstLocalDateTime(initial.liveAtIso) : ""
  );
  const [zoomUrl, setZoomUrl] = useState(initial.zoomUrl);
  const [recordingUrl, setRecordingUrl] = useState(initial.recordingUrl);
  const [selectedLessons, setSelectedLessons] = useState<string[]>(initial.recommendedLessonIds);
  const [externalVideos, setExternalVideos] = useState<ExternalVideoEntry[]>(
    initial.externalVideos.length > 0 ? initial.externalVideos : []
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const toggleLesson = (id: string) => {
    setSelectedLessons((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const save = async () => {
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/challenge/weeks/${initial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          homeworkPrompt,
          openAt: kstLocalToUtcISO(openAt),
          homeworkDueAt: kstLocalToUtcISO(homeworkDueAt),
          liveAt: liveAt ? kstLocalToUtcISO(liveAt) : null,
          zoomUrl,
          recordingUrl,
          recommendedLessonIds: selectedLessons,
          externalVideos: externalVideos.filter((v) => v.url.trim()),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "저장 실패");
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
    <div className="max-w-2xl space-y-5">
      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <h2 className="text-base font-bold text-neutral-800">기본 정보</h2>
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">주차 제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: Week 1 · 프로필과 콘셉트 세팅"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
            이번 주 안내 (선택)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="참여자에게 이번 주 흐름을 짧게 설명해 주세요. HTML 사용 가능."
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400 resize-none"
          />
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <h2 className="text-base font-bold text-neutral-800">팁스타그램의 편지</h2>
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
            편지 본문 <span className="text-neutral-400 font-normal">— 참여자 페이지 상단 카드에 그대로 노출됩니다</span>
          </label>
          <textarea
            value={homeworkPrompt}
            onChange={(e) => setHomeworkPrompt(e.target.value)}
            rows={12}
            placeholder={`격려하면서도 단호한 톤으로 이번 주 방향을 안내하세요.\n\n예:\n안녕하세요, 팁스타그램입니다.\n이번 주는 챌린지의 뿌리를 심는 주간이에요.\n답변은 최대한 구체적으로 남겨 주세요...`}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400 resize-none"
          />
          <p className="text-xs text-neutral-500 mt-1.5">
            줄바꿈은 그대로 보존됩니다. 참여자가 이번 주에 무엇을 · 왜 · 어떻게 해야 하는지 한 편의 편지처럼 안내해 주세요.
          </p>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <h2 className="text-base font-bold text-neutral-800">일정</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
              오픈 시각 (KST)
            </label>
            <input
              type="datetime-local"
              value={openAt}
              onChange={(e) => setOpenAt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
              숙제 마감 (KST)
            </label>
            <input
              type="datetime-local"
              value={homeworkDueAt}
              onChange={(e) => setHomeworkDueAt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <h2 className="text-base font-bold text-neutral-800">라이브 (선택)</h2>
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
            라이브 시각 (KST) — 비우면 라이브 없음
          </label>
          <input
            type="datetime-local"
            value={liveAt}
            onChange={(e) => setLiveAt(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">Zoom URL</label>
          <input
            type="url"
            value={zoomUrl}
            onChange={(e) => setZoomUrl(e.target.value)}
            placeholder="https://us02web.zoom.us/j/..."
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
            녹화본 URL — 라이브 후 업로드하고 붙여넣기
          </label>
          <input
            type="url"
            value={recordingUrl}
            onChange={(e) => setRecordingUrl(e.target.value)}
            placeholder="https://... (Vimeo · YouTube · Supabase 등)"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
          <p className="text-xs text-neutral-500 mt-1.5">
            녹화본이 새로 저장되면 참여자에게 자동으로 &quot;녹화본이 올라왔어요&quot; 이메일이 발송됩니다.
          </p>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <h2 className="text-base font-bold text-neutral-800">이번 주 추천 강의 (marketing-booster 66강 중)</h2>
        <p className="text-xs text-neutral-500">
          참여자 대시보드에 &quot;이번 주 볼 강의&quot;로 노출됩니다. 다중 선택 가능.
        </p>
        <div className="max-h-72 overflow-y-auto border border-neutral-100 rounded-xl p-3 space-y-3">
          {lessonChoices.length === 0 ? (
            <p className="text-sm text-neutral-400 py-6 text-center">
              marketing-booster 강의가 아직 세팅되지 않았어요.
            </p>
          ) : (
            (() => {
              const grouped: Record<string, LessonChoice[]> = {};
              for (const l of lessonChoices) {
                if (!grouped[l.sectionTitle]) grouped[l.sectionTitle] = [];
                grouped[l.sectionTitle].push(l);
              }
              return Object.entries(grouped).map(([section, lessons]) => (
                <div key={section}>
                  <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide mb-1.5">
                    {section}
                  </p>
                  <div className="space-y-1">
                    {lessons.map((l) => {
                      const active = selectedLessons.includes(l.id);
                      return (
                        <button
                          type="button"
                          key={l.id}
                          onClick={() => toggleLesson(l.id)}
                          className={
                            "w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs " +
                            (active
                              ? "bg-pink-100 text-pink-700 font-semibold"
                              : "text-neutral-600 hover:bg-neutral-50")
                          }
                        >
                          <span
                            className={
                              "shrink-0 w-4 h-4 rounded border flex items-center justify-center " +
                              (active
                                ? "border-pink-500 bg-pink-500 text-white"
                                : "border-neutral-300 bg-white")
                            }
                          >
                            {active && <Check className="w-3 h-3" />}
                          </span>
                          {l.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ));
            })()
          )}
        </div>
        <p className="text-xs text-neutral-500">
          현재 선택: {selectedLessons.length}개
        </p>
      </section>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
      )}

      <div className="flex items-center gap-3 pb-8">
        <button
          type="button"
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
    </div>
  );
}
