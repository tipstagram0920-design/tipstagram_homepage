"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";

export function SendAllFeedbackButton({ weekId, count }: { weekId: string; count: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const sendAll = async () => {
    if (
      !confirm(
        `저장된(미발송) 피드백 ${count}건을 지금 모두 전송할까요?\n전송하면 각 학생 화면에 공개되고 이메일이 발송됩니다.`
      )
    )
      return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/challenge/weeks/${weekId}/send-feedback`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert(`${data.sent ?? 0}건 전송 완료 (이메일 ${data.emailed ?? 0}건 발송)`);
        router.refresh();
      } else {
        alert(data.error || "전송에 실패했어요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={sendAll}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      저장된 피드백 일괄 전송 ({count})
    </button>
  );
}
