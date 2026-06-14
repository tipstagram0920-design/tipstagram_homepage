import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { COMPANY } from "@/lib/company";
import { LiveSignupForm } from "./LiveSignupForm";

export const metadata: Metadata = {
  title: `무료 라이브 대기방 신청 - ${COMPANY.serviceName}`,
  description: "팁스타그램 무료 라이브 대기방 입장 신청 페이지",
};

export default function LiveSignupPage() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-[calc(100vh-4rem)] pt-24 pb-20 bg-neutral-950 overflow-hidden">
        {/* 배경 그라디언트 글로우 */}
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #833ab4, transparent 70%)" }} />
        <div className="absolute top-1/3 -right-24 w-[420px] h-[420px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #fd1d1d, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/4 w-[360px] h-[360px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #fcaf45, transparent 70%)" }} />

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white/80 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              LIVE · 무료 공개
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-4">
              인스타그램 마케팅<br/>
              <span className="ig-gradient-text">무료 라이브</span> 대기방
            </h1>
            <p className="text-base sm:text-lg text-white/60 leading-relaxed">
              팁스타그램 무료 라이브를 가장 먼저 받아보세요.<br className="hidden sm:block"/>
              신청하면 입장용 오픈채팅방 주소를 이메일로 보내드립니다.
            </p>
          </div>

          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
            <LiveSignupForm />
          </div>

          <ul className="mt-8 space-y-2.5 text-sm text-white/55">
            {[
              "참가비 없음 · 누구나 신청 가능",
              "신청 즉시 이메일로 입장 링크 발송",
              "라이브 시작 전 알림과 자료 공유",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full ig-gradient shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
