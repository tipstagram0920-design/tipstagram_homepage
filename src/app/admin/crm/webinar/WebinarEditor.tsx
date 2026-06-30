"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Save, Sparkles, ChevronUp, ChevronDown, MessageCircle, Video, ShoppingBag, HelpCircle } from "lucide-react";

type StepKind = "webinar" | "endDate";

interface Step {
  kind: StepKind;
  offsetDays: number;
  time: string;
  subject: string;
  body: string;
  templateKey?: string;
  transactional?: boolean;
}

interface Audience {
  source?: string[];
  tagsAny?: string[];
  hasUser?: boolean;
  hasLiveSignup?: boolean;
  hasEbookStep1?: boolean;
  hasEbookStep2?: boolean;
  hasConsultation?: boolean;
}

interface Initial {
  id: string;
  name: string;
  webinarDate: string;
  endDate: string | null;
  zoomUrl: string | null;
  salesUrl: string | null;
  preQuestionUrl: string | null;
  audience: Record<string, unknown>;
  steps: unknown[];
  isActive: boolean;
  skipPast: boolean;
}

function toLocalDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
    "T" + pad(d.getHours()) + ":" + pad(d.getMinutes())
  );
}

export function WebinarEditor({
  initial,
  preset,
}: {
  initial?: Initial;
  preset: Step[];
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [webinarDate, setWebinarDate] = useState(
    initial ? toLocalDateTime(initial.webinarDate) : toLocalDateTime(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
  );
  const [endDate, setEndDate] = useState(
    initial?.endDate ? toLocalDateTime(initial.endDate) : ""
  );
  const [zoomUrl, setZoomUrl] = useState(initial?.zoomUrl ?? "");
  const [salesUrl, setSalesUrl] = useState(initial?.salesUrl ?? "");
  const [preQuestionUrl, setPreQuestionUrl] = useState(initial?.preQuestionUrl ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? false);
  const [skipPast, setSkipPast] = useState(initial?.skipPast ?? false);
  const [seedingKakao, setSeedingKakao] = useState(false);
  const [seedResult, setSeedResult] = useState<string>("");
  const [audience, setAudience] = useState<Audience>(
    (initial?.audience as Audience) ?? { hasLiveSignup: true }
  );
  const [steps, setSteps] = useState<Step[]>((initial?.steps as Step[]) ?? []);
  const [seedOperatorTasks, setSeedOperatorTasks] = useState(!initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fillPreset = () => {
    if (steps.length > 0 && !confirm("기존 step을 모두 덮어쓸까요?")) return;
    setSteps(JSON.parse(JSON.stringify(preset)));
  };

  const updateStep = (idx: number, patch: Partial<Step>) => {
    setSteps((arr) => arr.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };
  const removeStep = (idx: number) => setSteps((arr) => arr.filter((_, i) => i !== idx));
  const addStep = () => {
    setSteps((arr) => [
      ...arr,
      { kind: "webinar", offsetDays: -1, time: "09:00", subject: "", body: "" },
    ]);
  };
  const moveStep = (idx: number, dir: -1 | 1) => {
    setSteps((arr) => {
      const next = [...arr];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return arr;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const save = async () => {
    setError("");
    if (!name.trim()) { setError("이름을 입력해주세요."); return; }
    if (!webinarDate) { setError("라이브 날짜를 입력해주세요."); return; }
    setSaving(true);
    try {
      const url = initial ? `/api/admin/crm/webinar/${initial.id}` : "/api/admin/crm/webinar";
      const method = initial ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          webinarDate: new Date(webinarDate).toISOString(),
          endDate: endDate ? new Date(endDate).toISOString() : null,
          zoomUrl: zoomUrl.trim() || null,
          salesUrl: salesUrl.trim() || null,
          preQuestionUrl: preQuestionUrl.trim() || null,
          audience,
          steps,
          isActive,
          skipPast,
          seedOperatorTasks: !initial && seedOperatorTasks,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "저장 실패");
        return;
      }
      router.push("/admin/crm/webinar");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const seedKakao = async () => {
    if (!initial) return;
    setSeedingKakao(true);
    setSeedResult("");
    try {
      const res = await fetch(`/api/admin/crm/webinar/${initial.id}/seed-broadcasts`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSeedResult(`❌ ${data.error || "시드 실패"}`);
        return;
      }
      setSeedResult(`✅ ${data.created}개 생성, ${data.skipped}개 스킵 (이미 있음)`);
    } finally {
      setSeedingKakao(false);
    }
  };

  const remove = async () => {
    if (!initial) return;
    if (!confirm("정말 삭제할까요? 발송 기록도 함께 삭제됩니다.")) return;
    await fetch(`/api/admin/crm/webinar/${initial.id}`, { method: "DELETE" });
    router.push("/admin/crm/webinar");
    router.refresh();
  };

  return (
    <div className="max-w-4xl space-y-5">
      {/* 기본 정보 */}
      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">캠페인 이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 7월 8일 무료 라이브 시퀀스"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5">라이브 일시 (KST)</label>
            <input
              type="datetime-local"
              value={webinarDate}
              onChange={(e) => setWebinarDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
              모집 마감 일시 <span className="text-xs text-neutral-400 font-normal">(선택)</span>
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 rounded accent-pink-500" />
            <span className="text-sm text-neutral-700">활성화 (cron이 발송)</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={skipPast} onChange={(e) => setSkipPast(e.target.checked)} className="w-4 h-4 rounded accent-pink-500" />
            <span className="text-sm text-neutral-700">24시간 이상 지난 step은 건너뛰기</span>
          </label>
          {!initial && (
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={seedOperatorTasks} onChange={(e) => setSeedOperatorTasks(e.target.checked)} className="w-4 h-4 rounded accent-pink-500" />
              <span className="text-sm text-neutral-700">운영 to-do 자동 생성 (12개)</span>
            </label>
          )}
        </div>
      </section>

      {/* URL·링크 — 캠페인별 입력값 */}
      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-neutral-900 mb-1">캠페인 URL·링크</h2>
          <p className="text-xs text-neutral-500">메일·카톡 메시지의 변수에 자동 치환됩니다. 비우면 Setting 또는 자체 페이지로 fallback.</p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5 inline-flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-blue-500" />
              Zoom 라이브 URL
              <span className="text-xs text-neutral-400 font-normal">→ 변수 {`{{zoomUrl}}`}</span>
            </label>
            <input
              type="url"
              value={zoomUrl}
              onChange={(e) => setZoomUrl(e.target.value)}
              placeholder="https://us02web.zoom.us/j/..."
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5 inline-flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
              라이브 후 강의 신청 URL
              <span className="text-xs text-neutral-400 font-normal">→ 변수 {`{{salesUrl}}`}</span>
            </label>
            <input
              type="url"
              value={salesUrl}
              onChange={(e) => setSalesUrl(e.target.value)}
              placeholder="외부 결제 페이지 또는 강의 상세 페이지 URL"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5 inline-flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
              사전 질문 페이지 URL
              <span className="text-xs text-neutral-400 font-normal">→ 변수 {`{{preQuestionUrl}}`}</span>
            </label>
            <input
              type="url"
              value={preQuestionUrl}
              onChange={(e) => setPreQuestionUrl(e.target.value)}
              placeholder={initial ? `비우면 자체 페이지: /webinar/ask/${initial.id}` : "비우면 캠페인 저장 후 /webinar/ask/<id>"}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>
        </div>
      </section>

      {/* 카톡방 메시지 자동 시드 */}
      {initial && (
        <section className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border border-amber-200 p-5">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h2 className="text-base font-bold text-neutral-900 mb-1">카톡방 메시지 자동 시드</h2>
              <p className="text-xs text-neutral-600 mb-3">위에 입력한 일시·URL을 변수 치환해 12개의 카톡방 메시지가 BroadcastDraft에 자동 생성됩니다. 예약 시각이 도래하면 운영자에게 메일이 갑니다.</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={seedKakao}
                  disabled={seedingKakao}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  {seedingKakao ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  카톡 메시지 12개 시드
                </button>
                {seedResult && <p className="text-sm font-semibold text-neutral-700">{seedResult}</p>}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 세그먼트 (audience) */}
      <section className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-3">
        <div>
          <h2 className="text-base font-bold text-neutral-900 mb-1">발송 대상 (audience)</h2>
          <p className="text-xs text-neutral-500">아래 조건을 만족하는 컨택트에게 발송. 모두 체크 안 하면 전체 컨택트 (unsubscribe 제외).</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {([
            ["hasLiveSignup", "라이브 신청자"],
            ["hasEbookStep1", "1차 전자책 신청자"],
            ["hasEbookStep2", "2차 전자책 인증자"],
            ["hasConsultation", "진단 세션 신청자"],
            ["hasUser", "회원가입자"],
          ] as [keyof Audience, string][]).map(([key, label]) => (
            <label key={key} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 cursor-pointer hover:border-pink-300">
              <input
                type="checkbox"
                checked={!!audience[key]}
                onChange={(e) => setAudience((a) => ({ ...a, [key]: e.target.checked || undefined }))}
                className="w-4 h-4 rounded accent-pink-500"
              />
              <span className="text-sm text-neutral-700">{label}</span>
            </label>
          ))}
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">태그 (콤마 구분, 회원 한정)</label>
          <input
            type="text"
            value={(audience.tagsAny ?? []).join(", ")}
            onChange={(e) => {
              const tags = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
              setAudience((a) => ({ ...a, tagsAny: tags.length > 0 ? tags : undefined }));
            }}
            placeholder="VIP, 구매자"
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
        </div>
      </section>

      {/* Steps */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-neutral-900">메일 시퀀스 ({steps.length} step)</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fillPreset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              프리셋 11단계 채우기
            </button>
            <button
              type="button"
              onClick={addStep}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-neutral-200 hover:border-pink-300 hover:text-pink-500"
            >
              <Plus className="w-3.5 h-3.5" />
              빈 step 추가
            </button>
          </div>
        </div>

        {steps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-neutral-200 p-10 text-center text-sm text-neutral-400">
            "프리셋 11단계 채우기" 버튼을 누르면 D-10 / D-7 / D-5 / D-3 / D-1 / 라이브 직전 / D+1 / D+2 / 마감 D-3 / 마감 D-1 / 마감 직후 11개 step이 채워집니다.
          </div>
        ) : (
          <div className="space-y-3">
            {steps.map((s, idx) => (
              <StepCard
                key={idx}
                index={idx}
                step={s}
                count={steps.length}
                onPatch={(p) => updateStep(idx, p)}
                onRemove={() => removeStep(idx)}
                onMoveUp={() => moveStep(idx, -1)}
                onMoveDown={() => moveStep(idx, 1)}
              />
            ))}
          </div>
        )}
      </section>

      {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

      <div className="flex justify-between">
        <div>
          {initial && (
            <button
              onClick={remove}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> 삭제
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="px-5 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700">취소</button>
          <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold disabled:opacity-50 inline-flex items-center gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {initial ? "저장" : "만들기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  index,
  step,
  count,
  onPatch,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  index: number;
  step: Step;
  count: number;
  onPatch: (p: Partial<Step>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const label =
    step.kind === "webinar"
      ? step.offsetDays === 0
        ? "라이브 당일"
        : step.offsetDays < 0
        ? `라이브 D${step.offsetDays}`
        : `라이브 D+${step.offsetDays}`
      : step.offsetDays === 0
      ? "마감 당일"
      : step.offsetDays < 0
      ? `마감 D${step.offsetDays}`
      : `마감 D+${step.offsetDays}`;

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full ig-gradient flex items-center justify-center text-white text-xs font-black">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-neutral-700">{label} · {step.time} KST</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onMoveUp} disabled={index === 0} className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
          <button type="button" onClick={onMoveDown} disabled={index === count - 1} className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
          <button type="button" onClick={onRemove} className="p-1 text-neutral-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <select
          value={step.kind}
          onChange={(e) => onPatch({ kind: e.target.value as StepKind })}
          className="px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-pink-400 bg-white"
        >
          <option value="webinar">라이브 날짜 기준</option>
          <option value="endDate">마감 날짜 기준</option>
        </select>
        <input
          type="number"
          value={step.offsetDays}
          onChange={(e) => onPatch({ offsetDays: parseInt(e.target.value || "0", 10) })}
          placeholder="-10 (이전) / +1 (이후)"
          className="px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
        />
        <input
          type="time"
          value={step.time}
          onChange={(e) => onPatch({ time: e.target.value })}
          className="px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-neutral-600 mb-1">제목</label>
        <input
          type="text"
          value={step.subject}
          onChange={(e) => onPatch({ subject: e.target.value })}
          placeholder="{{name}}님, ..."
          className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-neutral-600 mb-1">본문 (HTML 가능)</label>
        <textarea
          value={step.body}
          onChange={(e) => onPatch({ body: e.target.value })}
          rows={6}
          placeholder="<p>안녕하세요 {{name}}님...</p>"
          className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-mono focus:outline-none focus:border-pink-400 resize-y"
        />
        <p className="text-[11px] text-neutral-400 mt-1">변수: {`{{name}}`} {`{{daysToWebinar}}`} {`{{daysToEnd}}`} {`{{webinarDate}}`} {`{{zoomUrl}}`} {`{{salesUrl}}`} {`{{preQuestionUrl}}`} {`{{ebook1Url}}`} {`{{ebook2Url}}`} {`{{consultationUrl}}`}</p>
      </div>
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={!!step.transactional} onChange={(e) => onPatch({ transactional: e.target.checked })} className="w-4 h-4 rounded accent-pink-500" />
        <span className="text-xs text-neutral-600">거래성 (수신거부한 사람에게도 발송)</span>
      </label>
    </div>
  );
}
