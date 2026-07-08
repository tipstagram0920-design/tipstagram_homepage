"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Eye, EyeOff } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (form.password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "회원가입 중 오류가 발생했습니다.");
        setLoading(false);
        return;
      }

      // 회원가입 성공 → 자동 로그인 후 원래 페이지로 복귀
      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      setLoading(false);

      if (signInResult?.error) {
        // 자동 로그인 실패 → 로그인 페이지로 (redirect 유지)
        const q = redirect !== "/" ? `?registered=1&redirect=${encodeURIComponent(redirect)}` : "?registered=1";
        router.push(`/login${q}`);
      } else {
        router.push(redirect);
        router.refresh();
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo size="md" className="mx-auto" />
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8">
          <h1 className="text-2xl font-black text-neutral-900 mb-6">회원가입</h1>

          {redirect !== "/" && (
            <p className="text-xs text-pink-600 bg-pink-50 border border-pink-100 px-3 py-2 rounded-lg mb-4">
              가입 완료 후 원래 페이지로 자동 이동합니다.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">이름</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="홍길동"
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">이메일</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="example@email.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">비밀번호</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="8자 이상"
                  required
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">비밀번호 확인</label>
              <input
                type="password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="비밀번호 재입력"
                required
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl ig-gradient text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "가입 중..." : "회원가입"}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            이미 계정이 있으신가요?{" "}
            <Link
              href={redirect !== "/" ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"}
              className="font-semibold text-pink-600 hover:underline"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50" />}>
      <RegisterForm />
    </Suspense>
  );
}
