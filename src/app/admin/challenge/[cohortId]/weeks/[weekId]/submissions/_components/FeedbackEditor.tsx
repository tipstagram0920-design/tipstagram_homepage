"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Send, MessageSquareText } from "lucide-react";

export function FeedbackEditor({
  submissionId,
  initialText,
  hasFeedback,
  feedbackAtHuman,
}: {
  submissionId: string;
  initialText: string;
  hasFeedback: boolean;
  feedbackAtHuman: string | null;
}) {
  const router = useRouter();
  const [text, setText] = useState(initialText);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  const send = async () => {
    setError("");
    setDone("");
    if (!text.trim()) {
      setError("피드백 내용을 입력해 주세요.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/challenge/submissions/${submissionId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackText: text.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "전송 실패");
        return;
      }
      setDone(
        data.emailed
          ? "피드백을 저장하고 학생에게 이메일을 보냈어요."
          : data.isFirst
            ? "피드백을 저장했어요. (이메일 발송은 실패했을 수 있어요)"
            : "피드백을 수정했어요. (이메일은 최초 1회만 발송돼요)"
      );
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-3">
      <p className="text-sm font-bold text-neutral-800 inline-flex items-center gap-1.5">
        <MessageSquareText className="w-4 h-4 text-pink-500" /> 강사 피드백
        {hasFeedback && feedbackAtHuman && (
          <span className="text-[11px] font-normal text-emerald-600">
            · 발송됨 {feedbackAtHuman}
          </span>
        )}
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="이 학생에게 보낼 피드백을 작성하세요. 줄바꿈은 그대로 전달됩니다."
        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400 resize-none"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {done && (
        <p className="text-sm text-green-600 inline-flex items-center gap-1.5">
          <Check className="w-4 h-4" /> {done}
        </p>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={send}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {hasFeedback ? "피드백 수정 저장" : "피드백 전송"}
        </button>
        {!hasFeedback && (
          <span className="text-[11px] text-neutral-400">전송 시 학생에게 이메일이 발송됩니다.</span>
        )}
      </div>
    </div>
  );
}
