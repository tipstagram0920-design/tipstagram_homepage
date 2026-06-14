"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

export function UnsubscribeForm({ token, email }: { token: string; email: string }) {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "처리 실패");
        return;
      }
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <p className="text-base font-semibold text-neutral-900">수신 거부 처리되었습니다.</p>
        <p className="text-sm text-neutral-500 mt-1">
          앞으로 마케팅성 메일을 보내드리지 않겠습니다.<br/>
          구매 확인 등 거래성 메일은 계속 발송될 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-neutral-700 mb-4">
        <strong className="text-neutral-900">{email}</strong> 주소의 마케팅 메일 수신을 거부합니다.
      </p>
      {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</p>}
      <button
        onClick={submit}
        disabled={loading}
        className="w-full px-4 py-3 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800 disabled:opacity-50 inline-flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        수신 거부하기
      </button>
    </div>
  );
}
