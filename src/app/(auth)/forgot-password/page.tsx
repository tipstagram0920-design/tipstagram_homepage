"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // 계정 존재 여부를 노출하지 않기 위해 실패해도 동일 화면을 보여준다.
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo size="md" className="mx-auto" />
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <MailCheck className="w-6 h-6 text-green-500" />
              </div>
              <h1 className="text-xl font-black text-neutral-900 mb-2">메일을 보냈습니다</h1>
              <p className="text-sm text-neutral-500 leading-relaxed mb-6">
                입력하신 주소로 가입된 계정이 있다면 재설정 링크가 발송됩니다.
                <br />
                메일함에서 확인해 주세요. 링크는 60분간 유효합니다.
              </p>
              <p className="text-xs text-neutral-400 mb-6">
                메일이 안 보이면 스팸함도 확인해 주세요.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-sm font-semibold text-pink-600 hover:underline"
              >
                다른 주소로 다시 보내기
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black text-neutral-900 mb-2">비밀번호 찾기</h1>
              <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
                가입하신 이메일 주소를 입력하시면 비밀번호를 다시 설정할 수 있는 링크를 보내드립니다.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl ig-gradient text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "보내는 중..." : "재설정 링크 받기"}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-neutral-500 mt-6">
            <Link href="/login" className="font-semibold text-pink-600 hover:underline">
              로그인으로 돌아가기
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          <Link href="/" className="hover:underline">팁스타그램 홈으로</Link>
        </p>
      </div>
    </div>
  );
}
