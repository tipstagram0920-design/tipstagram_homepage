"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RotateCcw } from "lucide-react";

export function TaskDoneButton({
  taskId,
  initialDone,
}: {
  taskId: string;
  initialDone: boolean;
}) {
  const router = useRouter();
  const [done, setDone] = useState(initialDone);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    const next = !done;
    setBusy(true);
    setDone(next);
    try {
      const res = await fetch(`/api/consulting/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: next }),
      });
      if (!res.ok) setDone(!next);
      else router.refresh();
    } catch {
      setDone(!next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={
        "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black transition-colors disabled:opacity-60 sm:w-auto " +
        (done
          ? "border border-neutral-200 bg-white text-neutral-500 hover:border-neutral-400 hover:text-neutral-800"
          : "ig-gradient text-white shadow-[0_10px_30px_-10px_rgba(131,58,180,0.6)]")
      }
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : done ? (
        <RotateCcw className="h-4 w-4" />
      ) : (
        <Check className="h-4 w-4" />
      )}
      {done ? "완료 취소하기" : "이 숙제 완료로 표시하기"}
    </button>
  );
}
