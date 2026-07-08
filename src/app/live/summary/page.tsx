import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { COMPANY } from "@/lib/company";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { Camera, Mail, Instagram, CheckCircle2 } from "lucide-react";
import { SummaryRequestForm } from "./SummaryRequestForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `강의 요약본 무료 신청 - ${COMPANY.serviceName}`,
  description: "라이브 강의를 인스타 스토리에 태그해서 올리시면 강의 요약본을 이메일로 보내드립니다.",
};

export default async function SummaryPage() {
  const verifyTag = (await getSetting(SETTING_KEYS.ebook2VerifyTag)) || "@tipstagram2023";

  return (
    <>
      <Navbar />
      <main className="bg-neutral-950 overflow-hidden">
        <section className="relative pt-24 pb-16">
          <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full opacity-25 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #833ab4, transparent 70%)" }} />
          <div className="absolute bottom-0 right-0 w-[320px] h-[320px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #fd1d1d, transparent 70%)" }} />

          <div className="relative max-w-xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-[11px] sm:text-xs font-semibold mb-5">
                <Camera className="w-3.5 h-3.5 text-amber-300" />
                라이브 강의 요약본 · 무료 발송
              </div>
              <h1 className="text-[26px] sm:text-4xl font-black text-white mb-3 leading-[1.25] tracking-tight">
                <span className="ig-gradient-text">강의 요약본</span>을<br/>이메일로 받아 가세요
              </h1>
              <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                라이브 강의를 다시 정리한 요약본이에요.<br/>
                간단한 인증 후 이메일로 다운로드 링크를 보내드립니다.
              </p>
            </div>

            {/* 3단계 안내 */}
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7 mb-6">
              <h2 className="text-white font-bold text-sm mb-4 tracking-wide">받는 방법 · 3단계</h2>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full ig-gradient text-white text-xs font-black flex items-center justify-center">1</span>
                  <div className="text-sm text-white/80 leading-relaxed">
                    강의를 듣고 있는 <strong>본인 모습·화면</strong>을 사진으로 찍어주세요.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full ig-gradient text-white text-xs font-black flex items-center justify-center">2</span>
                  <div className="text-sm text-white/80 leading-relaxed">
                    <strong>인스타 스토리</strong>에 올리면서 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-amber-300 font-bold">
                      <Instagram className="w-3 h-3" /> {verifyTag}
                    </span> 태그해 주세요.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full ig-gradient text-white text-xs font-black flex items-center justify-center">3</span>
                  <div className="text-sm text-white/80 leading-relaxed">
                    아래에 <strong>스토리 스크린샷</strong>과 이메일을 남기시면 요약본을 즉시 발송해요.
                  </div>
                </li>
              </ol>
            </div>

            {/* 폼 */}
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl">
              <SummaryRequestForm />
            </div>

            <ul className="mt-6 space-y-2 text-[13px] text-white/55">
              <li className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-amber-300" />
                입력하신 이메일로 즉시 발송돼요
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                이미지 검토는 자동, 사후 확인만 가볍게 진행합니다
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
