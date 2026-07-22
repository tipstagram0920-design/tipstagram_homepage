"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Send, Save, MessageSquareText } from "lucide-react";

export function FeedbackEditor({
  submissionId,
  initialText,
  hasFeedback,
  hasDraft,
  feedbackAtHuman,
}: {
  submissionId: string;
  initialText: string;
  hasFeedback: boolean; // 이미 학생에게 발송됨(feedbackAt 있음)
  hasDraft: boolean; // 저장은 됐지만 미발송
  feedbackAtHuman: string | null;
}) {
  const router = useRouter();
  const [text, setText] = useState(initialText);
  const [busy, setBusy] = useState<"save" | "send" | null>(null);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  const submit = async (send: boolean) => {
    setError("");
    setDone("");
    if (!text.trim()) {
      setError("피드백 내용을 입력해 주세요.");
      return;
    }
    if (send && !hasFeedback) {
      if (!confirm("이 학생에게 피드백을 전송할까요?\n전송하면 학생 화면에 공개되고 이메일이 발송됩니다.")) return;
    }
    setBusy(send ? "send" : "save");
    try {
      const res = await fetch(`/api/admin/challenge/submissions/${submissionId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackText: text.trim(), send }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "저장 실패");
        return;
      }
      setDone(
        send
          ? data.emailed
            ? "전송 완료 — 학생에게 이메일을 보냈어요."
            : "전송했어요(학생 공개). 이메일 발송은 실패했을 수 있어요."
          : "임시 저장했어요. 아직 학생에게 보이지 않아요. 검토 후 전송하세요."
      );
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-3">
      <p className="text-sm font-bold text-neutral-800 inline-flex items-center gap-1.5 flex-wrap">
        <MessageSquareText className="w-4 h-4 text-pink-500" /> 강사 피드백
        {hasFeedback && feedbackAtHuman ? (
          <span className="text-[11px] font-bold text-emerald-600">· 발송됨 {feedbackAtHuman}</span>
        ) : hasDraft ? (
          <span className="text-[11px] font-bold text-amber-600">· 저장됨 (미발송)</span>
        ) : null}
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
      <div className="flex items-center gap-2 flex-wrap">
        {!hasFeedback && (
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-300 bg-white text-neutral-700 text-sm font-bold hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-50"
          >
            {busy === "save" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            임시 저장
          </button>
        )}
        <button
          type="button"
          onClick={() => submit(true)}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800 disabled:opacity-50"
        >
          {busy === "send" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {hasFeedback ? "발송 내용 수정" : "확인 후 전송"}
        </button>
        {!hasFeedback && (
          <span className="text-[11px] text-neutral-400">전송하면 학생에게 이메일이 발송됩니다.</span>
        )}
      </div>
    </div>
  );
}
