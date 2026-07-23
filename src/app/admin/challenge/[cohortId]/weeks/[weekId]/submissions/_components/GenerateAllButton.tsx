"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

export function GenerateAllButton({ weekId, count }: { weekId: string; count: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (
      !confirm(
        `미발송 제출 ${count}건의 AI 피드백 초안을 모두 다시 생성할까요?\n기존 초안은 새 내용으로 덮어씁니다(이미 전송된 건은 제외). 잠시 걸릴 수 있어요.`
      )
    )
      return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/challenge/weeks/${weekId}/ai-draft-all`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert(`AI 초안 ${data.generated ?? 0}건 생성 완료${data.failed ? ` (실패 ${data.failed}건)` : ""}`);
        router.refresh();
      } else {
        alert(data.error || "생성에 실패했어요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={run}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-violet-300 bg-violet-50 text-violet-700 text-sm font-bold hover:border-violet-400 disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
      {loading ? "생성 중… (잠시만요)" : `전체 AI 초안 다시 생성 (${count})`}
    </button>
  );
}
