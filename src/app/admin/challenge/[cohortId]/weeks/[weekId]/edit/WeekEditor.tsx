"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Plus, Trash2, Video, FileText, Upload, MessageCircle, Copy } from "lucide-react";
import { toKstLocalDateTime, kstLocalToUtcISO } from "@/lib/kst";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// datetime-local(KST 기준 "YYYY-MM-DDTHH:mm") → "M월 D일(요일) 오전/오후 h시[ mm분]"
function formatKstLocalHuman(local: string): string {
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return "";
  const [, y, mo, d, hh, mm] = m;
  const year = Number(y), month = Number(mo), day = Number(d);
  const hour = Number(hh), minute = Number(mm);
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
  const ampm = hour < 12 ? "오전" : "오후";
  let h12 = hour % 12;
  if (h12 === 0) h12 = 12;
  const timeStr = minute === 0 ? `${ampm} ${h12}시` : `${ampm} ${h12}시 ${minute}분`;
  return `${month}월 ${day}일(${weekday}) ${timeStr}`;
}

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
  materials: MaterialEntry[];
}

export interface ExternalVideoEntry {
  title: string;
  url: string;
  description?: string;
}
const EMPTY_VIDEO: ExternalVideoEntry = { title: "", url: "", description: "" };

export interface MaterialEntry {
  title: string;
  url: string;
  filename: string;
  size?: number;
}

function formatBytes(n?: number) {
  if (!n || n <= 0) return "";
  if (n < 1024 * 1024) return `${Math.round(n / 1024)}KB`;
  return `${(n / (1024 * 1024)).toFixed(1)}MB`;
}

interface LessonChoice {
  id: string;
  title: string;
  sectionTitle: string;
}

export function WeekEditor({
  initial,
  lessonChoices,
  cohortName,
  weekIndex,
}: {
  initial: Initial;
  lessonChoices: LessonChoice[];
  cohortName: string;
  weekIndex: number;
}) {
  const router = useRouter();
  const [kakaoCopied, setKakaoCopied] = useState(false);
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
  const [materials, setMaterials] = useState<MaterialEntry[]>(initial.materials);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const uploadMaterial = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error || "파일 업로드에 실패했어요.");
        return;
      }
      const baseName = file.name.replace(/\.[^.]+$/, "");
      setMaterials((prev) => [
        ...prev,
        { title: baseName, url: data.url, filename: file.name, size: file.size },
      ]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
          materials: materials.filter((m) => m.url.trim()),
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

  // 단톡방에 붙여넣을 라이브 참여 안내 문구 (현재 입력값 기준 실시간 생성)
  const liveHuman = liveAt ? formatKstLocalHuman(liveAt) : "";
  const liveKakaoMessage = liveAt
    ? [
        `[${cohortName}] Week ${weekIndex} 라이브 안내 🎥`,
        ``,
        `📅 ${liveHuman}`,
        `🔗 접속 링크`,
        zoomUrl.trim() || "(줌 링크를 먼저 입력해 주세요)",
        ``,
        `시간 맞춰 위 링크로 들어와 주세요.`,
        `오늘 라이브에서 만나요! 💪`,
      ].join("\n")
    : "";

  const copyLiveKakao = async () => {
    if (!liveKakaoMessage) return;
    try {
      await navigator.clipboard.writeText(liveKakaoMessage);
      setKakaoCopied(true);
      setTimeout(() => setKakaoCopied(false), 2000);
    } catch {
      setError("복사에 실패했어요. 문구를 직접 선택해 복사해 주세요.");
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

      {/* 단톡방 라이브 참여 안내 문구 */}
      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <h2 className="text-base font-bold text-neutral-800 inline-flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-yellow-500" /> 라이브 참여 안내 (카톡 문구)
        </h2>
        <p className="text-xs text-neutral-500">
          위 <strong>라이브 시각</strong>과 <strong>Zoom URL</strong>로 문구가 자동 생성됩니다. 복사해서 단톡방에 붙여넣으세요.
          {" "}(값을 바꾸면 문구도 즉시 바뀌어요. 저장과 무관하게 복사 가능.)
        </p>

        {liveAt ? (
          <>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">
              {liveKakaoMessage}
            </div>
            <button
              type="button"
              onClick={copyLiveKakao}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:border-pink-400 hover:text-pink-600"
            >
              {kakaoCopied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" /> 복사됨
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> 카톡 문구 복사
                </>
              )}
            </button>
          </>
        ) : (
          <p className="text-sm text-neutral-400 bg-neutral-50 rounded-xl p-4 border border-neutral-100">
            위 &quot;라이브 (선택)&quot;에서 <strong>라이브 시각</strong>을 설정하면 여기에 카톡 안내 문구가 자동으로 만들어져요.
          </p>
        )}
      </section>

      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <h2 className="text-base font-bold text-neutral-800">강의 자료 (PPT 등)</h2>
        <p className="text-xs text-neutral-500">
          업로드한 파일은 참여자 주차 페이지에 &quot;강의 자료&quot; 다운로드 버튼으로 노출됩니다.
        </p>

        {materials.length > 0 && (
          <div className="space-y-2">
            {materials.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50"
              >
                <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) =>
                      setMaterials((prev) =>
                        prev.map((x, xi) => (xi === i ? { ...x, title: e.target.value } : x))
                      )
                    }
                    placeholder="자료 제목 (참여자에게 보이는 이름)"
                    className="w-full bg-transparent text-sm font-medium text-neutral-800 focus:outline-none"
                  />
                  <p className="text-[11px] text-neutral-400 truncate">
                    {m.filename}
                    {m.size ? ` · ${formatBytes(m.size)}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMaterials((prev) => prev.filter((_, xi) => xi !== i))}
                  className="shrink-0 p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50"
                  aria-label="자료 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".ppt,.pptx,.pdf,.key,.zip,.doc,.docx,.xls,.xlsx,.hwp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadMaterial(f);
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-neutral-300 text-sm font-semibold text-neutral-600 hover:border-pink-400 hover:text-pink-600 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> 업로드 중…
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" /> 파일 업로드
            </>
          )}
        </button>
        <p className="text-xs text-neutral-400">
          업로드 후 반드시 아래 <strong>저장</strong> 버튼을 눌러야 참여자에게 반영됩니다.
        </p>
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
