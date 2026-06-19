import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { COMPANY } from "@/lib/company";
import { ConsultationForm } from "./ConsultationForm";
import { Target, Sparkles, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: `1:1 진단 세션 신청 - ${COMPANY.serviceName}`,
  description:
    "팁스타그램 무료 라이브 신청자 중 단 5분에게 드리는 1:1 계정 진단 세션 신청 페이지.",
};

const BENEFITS = [
  {
    icon: Target,
    title: "내 계정에 맞춤 진단",
    desc: "어디서 막혀 있는지, 무엇부터 바꿔야 하는지 직접 짚어드립니다.",
  },
  {
    icon: Sparkles,
    title: "선정자에게 한정 제공",
    desc: "신청자 중 단 5명만 선정. 라이브 당일 직접 호명해 안내드립니다.",
  },
  {
    icon: MessageSquare,
    title: "구체적으로 적을수록 ↑",
    desc: "현재 고민·계정 현황을 자세히 적어주시면 선정 확률이 높아집니다.",
  },
];

export default function ConsultationPage() {
  return (
    <>
      <Navbar />
      <main className="bg-neutral-950 overflow-hidden">
        {/* Hero + 폼 */}
        <section className="relative pt-24 pb-16">
          <div className="absolute -top-32 -left-32 w-[420px] h-[420px] sm:w-[520px] sm:h-[520px] rounded-full opacity-25 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #833ab4, transparent 70%)" }} />
          <div className="absolute top-1/3 -right-24 w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #fd1d1d, transparent 70%)" }} />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #fcaf45, transparent 70%)" }} />

          <div className="relative max-w-xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-[11px] sm:text-xs font-semibold mb-5">
                <Target className="w-3.5 h-3.5 text-amber-300" />
                무료 라이브 한정 · 단 5분
              </div>
              <h1 className="text-[28px] leading-[1.2] sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                1:1 진단 세션<br/>
                <span className="ig-gradient-text">선착순 신청</span>
              </h1>
              <p className="text-sm sm:text-base text-white/65 leading-relaxed">
                현재 내 인스타그램이 어디서 막혀 있는지<br/>
                직접 보고 맞춤으로 짚어드립니다.
              </p>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl">
              <ConsultationForm />
            </div>

            <p className="mt-6 text-center text-[12px] sm:text-sm text-white/55 leading-relaxed">
              ⚠️ 신청 인원이 많을 경우 신청서 내용을 보고 선정하므로,<br/>
              <strong className="text-white">현재 고민을 구체적으로</strong> 적어주실수록 선정 확률이 높아집니다.<br/>
              선정 결과는 7월 8일(수) 저녁 8시 <strong className="text-white">무료 라이브</strong>에서 안내드립니다.
            </p>
          </div>
        </section>

        {/* 가치 */}
        <section className="relative px-4 sm:px-6 pb-20">
          <div className="max-w-2xl mx-auto">
            <p className="text-center text-[11px] sm:text-xs font-bold text-pink-300 tracking-[3px] mb-2">WHY</p>
            <h2 className="text-center text-2xl sm:text-3xl font-black text-white mb-8">왜 신청해야 하나요?</h2>
            <div className="space-y-3">
              {BENEFITS.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className="flex gap-4 bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                    <div className="shrink-0 w-10 h-10 rounded-xl ig-gradient flex items-center justify-center text-white">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-white mb-1">{b.title}</h3>
                      <p className="text-sm text-white/60">{b.desc}</p>
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
