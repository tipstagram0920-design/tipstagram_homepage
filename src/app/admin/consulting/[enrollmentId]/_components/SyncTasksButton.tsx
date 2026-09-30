"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FilePlus2, Loader2 } from "lucide-react";

/**
 * 이 고객의 숙제를 현재 템플릿에 맞춘다 — 빠진 숙제 추가 + Day·순서 정렬.
 * 아무것도 지우지 않으므로 진행 중인 고객에게도 쓸 수 있다.
 */
export function SyncTasksButton({ enrollmentId }: { enrollmentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const sync = async () => {
    if (
      !confirm(
        "이 고객의 숙제를 최신 흐름에 맞출까요?\n\n· 빠진 숙제를 추가합니다\n· 숙제 순서를 최신 순서로 옮깁니다 (예: 인포크 링크 → 페이지 4개를 만든 뒤로)\n· 작성한 내용과 완료 체크는 그대로 유지되고, 아무것도 삭제하지 않습니다"
      )
    )
      return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/consulting/${enrollmentId}/sync`, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        const parts = [
          json.added > 0 ? `숙제 ${json.added}개 추가` : "",
          json.moved > 0 ? `${json.moved}개 순서 정리` : "",
          json.leftover > 0 ? `템플릿에 없는 숙제 ${json.leftover}개는 그 날의 맨 뒤로 옮겼어요 (필요 없으면 직접 삭제하세요)` : "",
        ].filter(Boolean);
        alert(parts.length ? parts.join("\n") : "이미 최신 흐름이에요.");
        router.refresh();
      } else {
        alert("최신화에 실패했어요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={sync}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FilePlus2 className="w-3.5 h-3.5" />}
      최신 흐름으로 맞추기
    </button>
  );
}
