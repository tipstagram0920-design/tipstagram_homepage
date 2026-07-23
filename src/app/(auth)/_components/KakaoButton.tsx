"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

/** 카카오 브랜드 로그인 버튼 (노랑 #FEE500 + 검정 텍스트 + 말풍선 로고) */
export function KakaoButton({
  callbackUrl = "/",
  label = "카카오로 시작하기",
}: {
  callbackUrl?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        signIn("kakao", { callbackUrl });
      }}
      className="w-full py-3.5 rounded-xl bg-[#FEE500] text-[#191600] font-bold text-sm hover:brightness-95 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.79 1.86 5.24 4.65 6.62-.2.72-.74 2.66-.85 3.07-.13.51.19.5.4.36.16-.11 2.6-1.77 3.66-2.49.7.1 1.42.15 2.14.15 5.52 0 10-3.48 10-7.71C22 6.48 17.52 3 12 3z" />
      </svg>
      {loading ? "이동 중…" : label}
    </button>
  );
}
