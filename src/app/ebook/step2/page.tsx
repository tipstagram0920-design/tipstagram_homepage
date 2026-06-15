import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { COMPANY } from "@/lib/company";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { EbookStep2Form } from "./EbookStep2Form";
import { Instagram, Camera, Mail, Gift } from "lucide-react";

export const metadata: Metadata = {
  title: `2차 전자책 신청 - ${COMPANY.serviceName}`,
  description: "1차 전자책에 이어, 2차 전자책까지 무료로 받아가세요.",
};

export const dynamic = "force-dynamic";

export default async function EbookStep2Page() {
  const verifyTag = (await getSetting(SETTING_KEYS.ebook2VerifyTag)) || "@tipstagram2023";

  const guides = [
    {
      icon: Instagram,
      title: "1차 전자책 인스타 스토리에 업로드",
      desc: `1차 전자책의 표지·내용을 캡처해서 인스타그램 스토리에 올려주세요. 짧은 소감과 함께 ${verifyTag} 을 태그해주세요.`,
    },
    {
      icon: Camera,
      title: "스토리에 올라간 화면을 스크린샷",
      desc: "본인 스토리에 정상적으로 올라간 화면을 스크린샷 또는 캡처합니다.",
    },
    {
      icon: Mail,
      title: "아래 폼에 스크린샷·이메일 제출",
      desc: "이메일을 함께 입력하시면, 그 이메일로 2차 전자책 다운로드 링크를 즉시 보내드립니다.",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="bg-neutral-950 overflow-hidden">
        <section className="relative pt-24 pb-16">
          <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full opacity-25 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #833ab4, transparent 70%)" }} />
          <div className="absolute bottom-0 -right-24 w-[360px] h-[360px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #fcaf45, transparent 70%)" }} />

          <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-[11px] sm:text-xs font-semibold mb-5">
                <Gift className="w-3.5 h-3.5 text-amber-300" />
                2차 전자책 신청
              </div>
              <h1 className="text-[26px] leading-[1.2] sm:text-4xl font-black text-white mb-3">
                간단한 인증으로<br/>
                <span className="ig-gradient-text">2차 전자책</span>까지 받으세요
              </h1>
              <p className="text-sm sm:text-base text-white/65 leading-relaxed">
                인스타 스토리에 1차 전자책 사진을 올려<br className="hidden sm:block"/>
                <strong className="text-white">{verifyTag}</strong> 을 태그해주시면 됩니다.
              </p>
            </div>

            {/* 3단계 가이드 */}
            <div className="space-y-3 mb-10">
              {guides.map((g, i) => {
                const Icon = g.icon;
                return (
                  <div key={i} className="flex gap-4 bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                    <div className="shrink-0 w-10 h-10 rounded-xl ig-gradient flex items-center justify-center text-white text-sm font-black">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-amber-300" />
                        <h3 className="text-base sm:text-lg font-bold text-white">{g.title}</h3>
                      </div>
                      <p className="text-[13px] sm:text-sm text-white/65 leading-relaxed">{g.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 제출 폼 */}
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl">
              <h2 className="text-lg sm:text-xl font-black text-white mb-1">제출하기</h2>
              <p className="text-xs sm:text-sm text-white/55 mb-5">아래 두 가지를 입력하시면 즉시 메일을 받습니다.</p>
              <EbookStep2Form />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
