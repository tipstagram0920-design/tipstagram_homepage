"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Save } from "lucide-react";

type Trigger = "live_signup" | "register" | "purchase" | "lesson_complete";
type Channel = "email" | "kakao_alimtalk" | "sms";

interface Step {
  delayMinutes: number;
  action?: "send_message" | "add_tag";
  channel?: Channel;
  templateKey?: string;
  subject?: string;
  body?: string;
  tags?: string[];
}

interface Initial {
  id: string;
  name: string;
  trigger: string;
  isActive: boolean;
  conditions: Record<string, unknown> | null;
  steps: unknown[];
}

const TRIGGER_OPTIONS: { value: Trigger; label: string }[] = [
  { value: "live_signup", label: "라이브 신청" },
  { value: "register", label: "회원가입" },
  { value: "purchase", label: "구매 완료" },
  { value: "lesson_complete", label: "강의 완강" },
];

const CHANNEL_OPTIONS: { value: Channel; label: string }[] = [
  { value: "email", label: "이메일 (Resend)" },
  { value: "kakao_alimtalk", label: "카카오 알림톡 (Solapi)" },
  { value: "sms", label: "SMS (Solapi)" },
];

const DELAY_PRESETS = [
  { v: 0, l: "즉시" },
  { v: 60, l: "1시간 후" },
  { v: 60 * 24, l: "1일 후" },
  { v: 60 * 24 * 3, l: "3일 후" },
  { v: 60 * 24 * 7, l: "7일 후" },
  { v: 60 * 24 * 14, l: "14일 후" },
];

export function WorkflowEditor({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [trigger, setTrigger] = useState<Trigger>((initial?.trigger as Trigger) ?? "live_signup");
  const [isActive, setIsActive] = useState(initial?.isActive ?? false);
  const [conditionsJson, setConditionsJson] = useState(
    initial?.conditions ? JSON.stringify(initial.conditions, null, 2) : ""
  );
  const [steps, setSteps] = useState<Step[]>(
    (initial?.steps as Step[]) ?? [{ delayMinutes: 0, action: "send_message", channel: "email" }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateStep = (idx: number, patch: Partial<Step>) => {
    setSteps((arr) => arr.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const addStep = () => {
    setSteps((arr) => [
      ...arr,
      { delayMinutes: 1440, action: "send_message", channel: "email" },
    ]);
  };

  const removeStep = (idx: number) => {
    setSteps((arr) => arr.filter((_, i) => i !== idx));
  };

  const save = async () => {
    setError("");
    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    if (steps.length === 0) {
      setError("최소 1개 step이 필요합니다.");
      return;
    }
    let conditions: unknown = undefined;
    if (conditionsJson.trim()) {
      try {
        conditions = JSON.parse(conditionsJson);
      } catch {
        setError("조건 JSON이 올바르지 않습니다.");
        return;
      }
    }
    setSaving(true);
    try {
      const url = initial
        ? `/api/admin/crm/workflows/${initial.id}`
        : `/api/admin/crm/workflows`;
      const method = initial ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, trigger, isActive, conditions, steps }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "저장 실패");
        return;
      }
      router.push("/admin/crm/workflows");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!initial) return;
    if (!confirm("정말 삭제할까요? 진행 중인 run도 함께 사라집니다.")) return;
    await fetch(`/api/admin/crm/workflows/${initial.id}`, { method: "DELETE" });
    router.push("/admin/crm/workflows");
    router.refresh();
  };

  return (
    <div className="max-w-3xl space-y-5">
      {/* 기본 정보 */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 라이브 신청 D+1 알림"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-neutral-800 mb-1.5">트리거</label>
            <select
              value={trigger}
              onChange={(e) => setTrigger(e.target.value as Trigger)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400 bg-white"
            >
              {TRIGGER_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded accent-pink-500"
              />
              <span className="text-sm font-medium text-neutral-700">활성화</span>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1.5">
            조건 (JSON, 선택)
            <span className="ml-2 text-xs text-neutral-400 font-normal">예: {`{"productId":"abc"}`}</span>
          </label>
          <textarea
            value={conditionsJson}
            onChange={(e) => setConditionsJson(e.target.value)}
            rows={3}
            placeholder="비워두면 모든 트리거에 매칭"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-mono focus:outline-none focus:border-pink-400 resize-y"
          />
        </div>
      </div>

      {/* 단계 */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-neutral-900">실행 단계</h2>
        {steps.map((step, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-neutral-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full ig-gradient flex items-center justify-center text-white text-xs font-black">
                  {idx + 1}
                </span>
                <span className="text-sm font-semibold text-neutral-700">
                  {idx === 0 ? "트리거 후" : "직전 단계 후"} 지연
                </span>
              </div>
              {steps.length > 1 && (
                <button
                  onClick={() => removeStep(idx)}
                  className="text-xs text-neutral-400 hover:text-red-500 inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> 삭제
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DELAY_PRESETS.map((p) => (
                <button
                  key={p.v}
                  onClick={() => updateStep(idx, { delayMinutes: p.v })}
                  className={
                    "px-3 py-2 rounded-lg text-xs font-semibold border transition-colors " +
                    (step.delayMinutes === p.v
                      ? "border-pink-300 bg-pink-50 text-pink-600"
                      : "border-neutral-200 text-neutral-700 hover:border-pink-300")
                  }
                >
                  {p.l}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={step.delayMinutes}
                onChange={(e) => updateStep(idx, { delayMinutes: parseInt(e.target.value || "0", 10) })}
                className="w-32 px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
              />
              <span className="text-xs text-neutral-500">분 후</span>
            </div>

            {/* action */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">동작</label>
              <select
                value={step.action ?? "send_message"}
                onChange={(e) => updateStep(idx, { action: e.target.value as Step["action"] })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-pink-400 bg-white"
              >
                <option value="send_message">메시지 발송</option>
                <option value="add_tag">회원 태그 추가</option>
              </select>
            </div>

            {step.action !== "add_tag" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">채널</label>
                  <select
                    value={step.channel ?? "email"}
                    onChange={(e) => updateStep(idx, { channel: e.target.value as Channel })}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-pink-400 bg-white"
                  >
                    {CHANNEL_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    템플릿 키 (EmailTemplate.type)
                    <span className="ml-2 text-xs text-neutral-400 font-normal">예: live_d1, purchase_d3</span>
                  </label>
                  <input
                    type="text"
                    value={step.templateKey ?? ""}
                    onChange={(e) => updateStep(idx, { templateKey: e.target.value })}
                    placeholder="템플릿 키 입력 (or 아래에 본문 직접 입력)"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm font-mono focus:outline-none focus:border-pink-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">제목 (템플릿 미지정 시)</label>
                  <input
                    type="text"
                    value={step.subject ?? ""}
                    onChange={(e) => updateStep(idx, { subject: e.target.value })}
                    placeholder="예: {{name}}님, 라이브가 곧 시작됩니다"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">본문 (HTML 가능)</label>
                  <textarea
                    value={step.body ?? ""}
                    onChange={(e) => updateStep(idx, { body: e.target.value })}
                    rows={4}
                    placeholder="<p>안녕하세요 {{name}}님...</p>"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-xs font-mono focus:outline-none focus:border-pink-400 resize-y"
                  />
                </div>
              </>
            )}

            {step.action === "add_tag" && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">추가할 태그 (콤마 구분)</label>
                <input
                  type="text"
                  value={(step.tags ?? []).join(", ")}
                  onChange={(e) =>
                    updateStep(idx, {
                      tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="VIP, 라이브참여"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
                />
              </div>
            )}
          </div>
        ))}
        <button
          onClick={addStep}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-neutral-300 text-sm font-semibold text-neutral-500 hover:border-pink-300 hover:text-pink-500"
        >
          <Plus className="w-4 h-4" /> 단계 추가
        </button>
      </div>

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
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700"
          >
            취소
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {initial ? "저장" : "만들기"}
          </button>
        </div>
      </div>
    </div>
  );
}
