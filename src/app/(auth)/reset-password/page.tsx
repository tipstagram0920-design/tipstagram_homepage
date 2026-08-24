"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") || "";

  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => setValid(!!data.valid))
      .catch(() => setValid(false))
      .finally(() => setChecking(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (password !== confirm) {
      setError("비밀번호가 서로 다릅니다.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "변경 실패");
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return <p className="text-center text-sm text-neutral-400 py-6">확인 중...</p>;
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        </div>
        <h1 className="text-xl font-black text-neutral-900 mb-2">비밀번호가 변경되었습니다</h1>
        <p className="text-sm text-neutral-500 mb-6">잠시 후 로그인 화면으로 이동합니다.</p>
        <Link
          href="/login"
          className="inline-block px-5 py-3 rounded-xl ig-gradient text-white text-sm font-bold"
        >
          지금 로그인하기
        </Link>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <h1 className="text-xl font-black text-neutral-900 mb-2">링크가 만료되었습니다</h1>
        <p className="text-sm text-neutral-500 leading-relaxed mb-6">
          재설정 링크는 60분간, 한 번만 사용할 수 있습니다.
          <br />
          번거로우시겠지만 다시 요청해 주세요.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block px-5 py-3 rounded-xl ig-gradient text-white text-sm font-bold"
        >
          재설정 링크 다시 받기
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-black text-neutral-900 mb-2">새 비밀번호 설정</h1>
      <p className="text-sm text-neutral-500 mb-6">앞으로 사용하실 비밀번호를 입력해 주세요.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">새 비밀번호</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상"
              required
              className="w-full px-4 py-3 pr-11 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">비밀번호 확인</label>
          <input
            type={showPw ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="한 번 더 입력해 주세요"
            required
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
          />
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl ig-gradient text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "변경 중..." : "비밀번호 변경"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo size="md" className="mx-auto" />
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8">
          <Suspense fallback={<p className="text-center text-sm text-neutral-400 py-6">불러오는 중...</p>}>
            <ResetForm />
          </Suspense>
        </div>
        <p className="text-center text-xs text-neutral-400 mt-6">
          <Link href="/" className="hover:underline">팁스타그램 홈으로</Link>
        </p>
      </div>
    </div>
  );
}
