"use client";

import { useState, useEffect, useRef } from "react";
import {
  Copy,
  Check,
  Loader2,
  Save,
  Sparkles,
  MessageSquareText,
  CloudUpload,
  ArrowRight,
  ArrowDownToLine,
} from "lucide-react";

/**
 * 입력값이 바뀌면 잠시 뒤 자동으로 임시 저장(디바운스). 버튼 없이도 작성 중인 내용이 보존된다.
 * 초기값(initialData로 세팅된 상태)은 저장하지 않는다.
 */
export function useGuideAutosave(taskId: string, data: unknown, delay = 900) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const lastSaved = useRef<string>(JSON.stringify(data ?? null));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const serialized = JSON.stringify(data ?? null);
    if (serialized === lastSaved.current) return; // 변화 없음 → 저장 안 함
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      setSaved(false);
      try {
        const res = await fetch(`/api/consulting/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data }),
        });
        if (res.ok) {
          lastSaved.current = serialized;
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      } finally {
        setSaving(false);
      }
    }, delay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [taskId, data, delay]);

  return { saving, saved };
}

export function AutosaveStatus({ saving, saved }: { saving: boolean; saved: boolean }) {
  return (
    <span className="text-[11px] text-neutral-400 inline-flex items-center gap-1">
      {saving ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" /> 자동 저장 중…
        </>
      ) : saved ? (
        <>
          <Check className="w-3 h-3 text-green-600" /> 임시 저장됨
        </>
      ) : (
        <>
          <CloudUpload className="w-3 h-3" /> 자동 저장
        </>
      )}
    </span>
  );
}

export function useGuideSave(taskId: string) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const save = async (data: unknown) => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/consulting/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };
  return { saving, saved, save };
}

export function SaveButton({
  onClick,
  saving,
  saved,
}: {
  onClick: () => void;
  saving: boolean;
  saved: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={saving}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        저장
      </button>
      {saved && (
        <span className="text-xs text-green-600 inline-flex items-center gap-1">
          <Check className="w-3.5 h-3.5" /> 저장됨
        </span>
      )}
    </div>
  );
}

export function FeedbackButton({
  onClick,
  saving,
  saved,
  label = "피드백 받기",
}: {
  onClick: () => void;
  saving: boolean;
  saved: boolean;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={saving}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {label}
      </button>
      {saved && (
        <span className="text-xs text-green-600 inline-flex items-center gap-1">
          <Check className="w-3.5 h-3.5" /> 저장됨
        </span>
      )}
    </div>
  );
}

export function FeedbackBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-pink-200 bg-pink-50/40 p-3.5">
      <p className="text-xs font-bold text-pink-700 inline-flex items-center gap-1.5 mb-2">
        <MessageSquareText className="w-4 h-4" /> 피드백
      </p>
      {children}
    </div>
  );
}

export function CopyButton({ text, label = "복사" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* noop */
        }
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-700 hover:border-pink-400 hover:text-pink-600"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "복사됨" : label}
    </button>
  );
}

export const FIELD =
  "w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-pink-400";
export const FIELD_TA = FIELD + " resize-none";
export const FLABEL = "block text-[13px] font-semibold text-neutral-800 mb-1";

// 이모지 포함 글자 수 (인스타 바이오 카운트 근사)
export const charLen = (s: string) => Array.from(s).length;

// 긴 입력을 핵심만 남겨 짧게 압축 (구분자 우선 → 단어 경계 클립)
export function compress(input: string, maxLen: number): string {
  const t = (input || "").trim().replace(/\s+/g, " ");
  if (!t) return "";
  if (charLen(t) <= maxLen) return t;
  const segs = t.split(/[·/|,\n]/).map((x) => x.trim()).filter(Boolean);
  if (segs.length > 1) {
    let out = "";
    for (const seg of segs) {
      const cand = out ? `${out} · ${seg}` : seg;
      if (charLen(cand) > maxLen) break;
      out = cand;
    }
    if (out) return out;
  }
  const arr = Array.from(t);
  const clipped = arr.slice(0, maxLen).join("");
  const lastSpace = clipped.lastIndexOf(" ");
  return lastSpace > maxLen * 0.6 ? clipped.slice(0, lastSpace) : clipped;
}

// ---------------------------------------------------------------------------
// 숙제를 단계로 끊어 보여주고, 앞/다음 숙제와 이어주는 조각들
// ---------------------------------------------------------------------------

/** 도우미 안에서 "STEP n. 제목" 구분선 */
export function StepHeader({
  n,
  title,
  desc,
  done,
}: {
  n: number;
  title: string;
  desc?: string;
  done?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5 pt-1">
      <span
        className={
          "shrink-0 mt-0.5 w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center " +
          (done ? "bg-emerald-500 text-white" : "ig-gradient text-white")
        }
      >
        {done ? <Check className="w-3.5 h-3.5" /> : n}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-black text-neutral-900 leading-6">{title}</p>
        {desc && <p className="mt-0.5 text-[12px] leading-5 text-neutral-500">{desc}</p>}
      </div>
    </div>
  );
}

/** 앞 숙제 답을 그대로 끌어오는 버튼 */
export function PrefillButton({
  onClick,
  label = "앞 숙제에서 가져오기",
  disabled,
}: {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}) {
  const [used, setUsed] = useState(false);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        onClick();
        setUsed(true);
        setTimeout(() => setUsed(false), 2000);
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-[11.5px] font-bold text-indigo-600 hover:border-indigo-400 disabled:opacity-40"
    >
      {used ? <Check className="w-3.5 h-3.5" /> : <ArrowDownToLine className="w-3.5 h-3.5" />}
      {used ? "가져왔어요" : label}
    </button>
  );
}

/** 이 숙제의 결과가 어디로 이어지는지 + 다음 숙제 바로가기 */
export function NextTaskBox({
  title,
  items,
  next,
  ready,
}: {
  title: string;
  items: string[];
  next?: { id: string; title: string; day: number } | null;
  ready?: boolean;
}) {
  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
      <p className="inline-flex items-center gap-1.5 text-[13px] font-bold text-indigo-700">
        <ArrowRight className="w-3.5 h-3.5" /> {title}
      </p>
      <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[12.5px] leading-5 text-indigo-900/80">
        {items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
      {next && (
        <a
          href={`/consulting/${next.id}`}
          className={
            "mt-3 flex items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-3 transition-colors " +
            (ready
              ? "border-indigo-300 hover:border-indigo-500"
              : "border-neutral-200 hover:border-neutral-400")
          }
        >
          <span className="min-w-0">
            <span className="block text-[11px] font-bold text-neutral-400">
              다음 숙제 · Day {next.day}
            </span>
            <span className="block truncate text-[13.5px] font-bold text-neutral-900">
              {next.title}
            </span>
          </span>
          <ArrowRight className="w-4 h-4 shrink-0 text-neutral-400" />
        </a>
      )}
      {next && !ready && (
        <p className="mt-2 text-[11.5px] text-indigo-900/60">
          위 단계를 먼저 끝내면 다음 숙제가 훨씬 쉬워집니다.
        </p>
      )}
    </div>
  );
}
