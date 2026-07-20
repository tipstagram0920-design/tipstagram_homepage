"use client";

import { useState } from "react";
import { Copy, Check, Loader2, Save, Sparkles, MessageSquareText } from "lucide-react";

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
