import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { COMPANY } from "@/lib/company";
import { MessageSquareText, Mail, Gift } from "lucide-react";
import { SurveyForm } from "./SurveyForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `라이브 설문 (자료 3종 무료) - ${COMPANY.serviceName}`,
  description:
    "무료 라이브를 들으신 소감을 짧게 남겨 주세요. 응답 즉시 강의 요약본·인스타 자주 묻는 질문 10·후킹 패턴 50선 세 가지 자료를 이메일로 보내드립니다.",
};

export default function SurveyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-neutral-950 overflow-hidden">
        <section className="relative pt-24 pb-16">
          <div
            className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full opacity-25 blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, #833ab4, transparent 70%)" }}
          />
          <div
            className="absolute bottom-0 right-0 w-[320px] h-[320px] rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, #fd1d1d, transparent 70%)" }}
          />

          <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-[11px] sm:text-xs font-semibold mb-5">
                <MessageSquareText className="w-3.5 h-3.5 text-amber-300" />
                라이브 설문 · 자료 3종 무료 발송
              </div>
              <h1 className="text-[26px] sm:text-4xl font-black text-white mb-3 leading-[1.25] tracking-tight">
                라이브 어떠셨어요?<br />
                <span className="ig-gradient-text">3분 응답</span>하면 자료 3종
              </h1>
              <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                다음 라이브를 더 잘 만들기 위해 소감을 짧게 들려주세요.<br />
                응답 즉시 강의 요약본 · 자주 묻는 질문 10 · 후킹 패턴 50선을 이메일로 보내드려요.
              </p>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7 mb-6">
              <h2 className="text-white font-bold text-sm mb-4 tracking-wide">응답하면 받는 자료</h2>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <Gift className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
                  <div className="text-sm text-white/80 leading-relaxed">
                    <strong>강의 요약본</strong> — 라이브 핵심을 한 장에 정리
                  </div>
                </li>
                <li className="flex gap-3">
                  <Gift className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
                  <div className="text-sm text-white/80 leading-relaxed">
                    <strong>인스타그램 자주 묻는 질문 10</strong> — 답변집
                  </div>
                </li>
                <li className="flex gap-3">
                  <Gift className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
                  <div className="text-sm text-white/80 leading-relaxed">
                    <strong>50만+ 인스타 후킹 패턴 50선</strong> — 3초 후킹 문장 모음
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl">
              <SurveyForm />
            </div>

            <ul className="mt-6 space-y-2 text-[13px] text-white/55">
              <li className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-amber-300" />
                입력하신 이메일로 세 자료를 즉시 발송해 드려요
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
