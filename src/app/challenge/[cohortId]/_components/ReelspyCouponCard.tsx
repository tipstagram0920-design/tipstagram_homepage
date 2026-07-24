"use client";

import { useState } from "react";
import { Ticket, Copy, Check, ExternalLink } from "lucide-react";

const COUPON = "PROMONTH";
const REELSPY_URL = "https://reelspy.vercel.app";

export function ReelspyCouponCard() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(COUPON);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="mt-8 rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50/60 p-6 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-start gap-3 mb-4">
        <div className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_16px_-6px_rgba(124,58,237,0.5)]">
          <Ticket className="w-5 h-5" strokeWidth={2.25} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold tracking-[1.5px] uppercase text-violet-600 mb-1">챌린지 참여자 혜택</p>
          <h2 className="text-lg sm:text-xl font-black text-neutral-900 leading-tight">릴스파이 30회 무료 쿠폰</h2>
          <p className="text-[13px] text-neutral-600 mt-1">
            바이럴 릴스를 찾고 후킹·구성을 분석하는 <strong>릴스파이(reelspy)</strong>를 <strong>30회 무료</strong>로 쓸 수 있어요.
          </p>
        </div>
      </div>

      {/* 쿠폰 코드 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-violet-300 bg-white px-4 py-3">
          <span className="font-black text-lg tracking-[2px] text-violet-700">{COUPON}</span>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-bold hover:bg-violet-700"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "복사됨" : "복사"}
          </button>
        </div>
      </div>

      {/* 사용 방법 */}
      <div className="rounded-2xl bg-white/70 border border-violet-100 p-4 mb-4">
        <p className="text-[12px] font-bold text-neutral-800 mb-2">사용 방법</p>
        <ol className="text-[13px] text-neutral-700 leading-relaxed space-y-1.5 list-none">
          <li><strong className="text-violet-700">1.</strong> 아래 &lsquo;릴스파이 열기&rsquo;로 접속해 로그인(또는 가입)해요.</li>
          <li><strong className="text-violet-700">2.</strong> 쿠폰 입력란에 <strong>{COUPON}</strong>을 입력하고 적용해요.</li>
          <li><strong className="text-violet-700">3.</strong> 30회 무료 분석이 충전돼요. 레퍼런스 릴스를 넣고 후킹·구성을 분석해 내 콘텐츠로 변형하세요.</li>
        </ol>
      </div>

      <a
        href={REELSPY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800 shadow-[0_6px_20px_-6px_rgba(0,0,0,0.4)]"
      >
        릴스파이 열기 <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
