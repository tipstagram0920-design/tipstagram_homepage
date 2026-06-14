"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function WorkflowToggle({ id, initial }: { id: string; initial: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    const next = !on;
    setOn(next);
    try {
      await fetch(`/api/admin/crm/workflows/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors " +
        (on ? "bg-pink-500" : "bg-neutral-200")
      }
      aria-label="활성 토글"
    >
      <span
        className={
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform " +
          (on ? "translate-x-5" : "translate-x-0.5")
        }
      />
    </button>
  );
}
