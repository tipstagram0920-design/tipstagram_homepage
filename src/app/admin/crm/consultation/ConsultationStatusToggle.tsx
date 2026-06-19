"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const OPTIONS = [
  { value: "pending", label: "대기" },
  { value: "selected", label: "선정" },
  { value: "done", label: "완료" },
  { value: "rejected", label: "제외" },
];

export function ConsultationStatusToggle({ id, current }: { id: string; current: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const change = async (value: string) => {
    if (value === current) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/crm/consultation/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <select
      value={current}
      onChange={(e) => change(e.target.value)}
      disabled={busy}
      className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:border-pink-400 disabled:opacity-50"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
