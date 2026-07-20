"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Loader2 } from "lucide-react";

export function ResetTasksButton({ enrollmentId }: { enrollmentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const reset = async () => {
    if (!confirm("이 고객의 할 일을 최신 기본 템플릿으로 초기화할까요?\n기존 할 일과 도우미 입력값은 삭제됩니다.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/consulting/${enrollmentId}/reset`, { method: "POST" });
      if (res.ok) router.refresh();
      else alert("초기화에 실패했어요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={reset}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:border-red-300 hover:text-red-600 disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
      최신 템플릿으로 초기화
    </button>
  );
}
