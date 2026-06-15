import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { COMPANY } from "@/lib/company";
import { EbookSignupForm } from "./EbookSignupForm";
import { BookOpen, Mail, Download, Gift } from "lucide-react";

export const metadata: Metadata = {
  title: `무료 전자책 신청 - ${COMPANY.serviceName}`,
  description:
    "인스타그램으로 매출을 만드는 사람들이 알아두는 핵심 노하우. 무료 전자책으로 받아보세요.",
};

const STEPS = [
  { icon: Mail, label: "이름·이메일 입력", desc: "1분이면 신청 완료" },
  { icon: Download, label: "1차 전자책 다운로드", desc: "이메일로 즉시 발송" },
  { icon: Gift, label: "2차 전자책까지", desc: "간단한 인증으로 무료" },
];

export default function EbookSignupPage() {
  return (
    <>
      <Navbar />
      <main className="bg-neutral-950 overflow-hidden">
        <section id="signup" className="relative pt-24 pb-20">
          {/* 글로우 */}
          <div className="absolute -top-32 -left-32 w-[420px] h-[420px] sm:w-[520px] sm:h-[520px] rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #833ab4, transparent 70%)" }} />
          <div className="absolute top-1/3 -right-24 w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #fd1d1d, transparent 70%)" }} />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #fcaf45, transparent 70%)" }} />

          <div className="relative max-w-xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-[11px] sm:text-xs font-semibold mb-5">
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                무료 전자책 · 2단계 시리즈
              </div>
              <h1 className="text-[28px] leading-[1.2] sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                인스타그램으로<br/>
                <span className="ig-gradient-text">매출을 만드는 핵심</span>을<br/>
                책으로 받아가세요
              </h1>
              <p className="text-sm sm:text-base text-white/65 leading-relaxed">
                이름과 이메일만 입력하시면 1차 전자책을<br/>
                이메일로 바로 보내드립니다.
              </p>
            </div>

            {/* 신청 폼 */}
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl">
              <EbookSignupForm />
            </div>
          </div>
        </section>

        {/* 안내 단계 */}
        <section className="relative px-4 sm:px-6 pb-20">
          <div className="max-w-2xl mx-auto">
            <p className="text-center text-[11px] sm:text-xs font-bold text-pink-300 tracking-[3px] mb-2">HOW IT WORKS</p>
            <h2 className="text-center text-2xl sm:text-3xl font-black text-white mb-8">받는 방법</h2>
            <div className="space-y-3">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex gap-4 bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                    <div className="shrink-0 w-10 h-10 rounded-xl ig-gradient flex items-center justify-center text-white">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-white mb-1">
                        STEP {i + 1}. {s.label}
                      </h3>
                      <p className="text-sm text-white/60">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
