"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, Trophy } from "lucide-react";

export function PasswordGate({
  cohortId,
  cohortName,
}: {
  cohortId: string;
  cohortName: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/challenge/${cohortId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "입장 비밀번호가 올바르지 않아요.");
        return;
      }
      // 등록 성공 → 대시보드로 새로고침
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] p-8 sm:p-10 text-center">
      <div className="mx-auto mb-5 w-20 h-20 rounded-3xl ig-gradient shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_30px_-8px_rgba(131,58,180,0.5)] flex items-center justify-center">
        <Trophy className="w-9 h-9 text-white drop-shadow" strokeWidth={2.25} />
      </div>
      <p className="text-[11px] font-bold tracking-[2px] uppercase text-neutral-500 mb-1">
        5주 챌린지
      </p>
      <h1 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 mb-2">
        {cohortName}
      </h1>
      <p className="text-[13px] text-neutral-500 leading-relaxed mb-6">
        참여자 전용 공간이에요.
        <br />
        안내받은 <span className="font-semibold text-neutral-700">입장 비밀번호</span>를 입력하면 바로 시작할 수 있어요.
      </p>

      <form onSubmit={submit} className="space-y-3">
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="입장 비밀번호"
            autoFocus
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-neutral-200 text-sm text-center focus:outline-none focus:border-pink-400"
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || !password.trim()}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800 disabled:opacity-50 shadow-[0_6px_20px_-6px_rgba(0,0,0,0.4)]"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          입장하기
        </button>
      </form>
      <p className="text-[11px] text-neutral-400 mt-5">
        한 번 입장하면 다음부터는 로그인만 해도 바로 들어올 수 있어요.
      </p>
    </div>
  );
}
