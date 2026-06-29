import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { COMPANY } from "@/lib/company";
import { LiveSignupForm } from "./LiveSignupForm";
import { TrackerPixel } from "@/components/TrackerPixel";
import { TrendingUp, Users as UsersIcon, Banknote, BookOpen, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: `무료 라이브 대기방 신청 - ${COMPANY.serviceName}`,
  description:
    "평범한 사람도 인스타그램으로 노출·팔로워·매출을 늘리는 방법. 1년 만에 12만 팔로워·6억 수익을 만든 비법을 무료 라이브로 공개합니다.",
};

const ACHIEVEMENTS = [
  { icon: UsersIcon, label: "팔로워", value: "120,000+", desc: "1년 만에" },
  { icon: Banknote, label: "누적 수익", value: "6억원", desc: "인스타 한 채널로" },
  { icon: TrendingUp, label: "성장 사례", value: "0 → 10K+", desc: "수강생 다수" },
];

const LIVE_TOPICS = [
  { title: "노출 알고리즘의 핵심", desc: "왜 누구는 1만 명이 보고 누구는 30명이 보는지 — 노출의 원리부터 콘텐츠 공식까지." },
  { title: "팔로워가 빠르게 늘어나는 구조", desc: "광고 없이도 평범한 사람의 계정이 0에서 12만까지 가는 콘텐츠·기획·운영 루틴." },
  { title: "팔로워를 매출로 바꾸는 법", desc: "보여주는 콘텐츠 → 사고 싶게 만드는 콘텐츠. 1년 만에 6억 수익을 만든 세일즈 퍼널 설계." },
  { title: "지금 당장 적용 가능한 액션", desc: "라이브가 끝나는 그 날, 오늘 밤부터 바꿀 수 있는 3가지 점검 포인트." },
];

export default function LiveSignupPage() {
  return (
    <>
      <TrackerPixel page="live" />
      <Navbar />
      <main className="bg-neutral-950 overflow-hidden">
        {/* ===== HERO + 신청 폼 ===== */}
        <section id="signup" className="relative pt-24 pb-16 sm:pb-20">
          <div className="absolute -top-32 -left-32 w-[420px] h-[420px] sm:w-[520px] sm:h-[520px] rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #833ab4, transparent 70%)" }} />
          <div className="absolute top-1/3 -right-24 w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #fd1d1d, transparent 70%)" }} />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #fcaf45, transparent 70%)" }} />

          <div className="relative max-w-xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-[11px] sm:text-xs font-semibold mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                LIVE · 무료 공개
              </div>
              <h1 className="text-[28px] leading-[1.2] sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                평범한 사람도<br/>
                <span className="ig-gradient-text">인스타그램으로 매출</span>을<br/>
                만들 수 있습니다
              </h1>
              <p className="text-sm sm:text-base text-white/65 leading-relaxed">
                1년 만에 12만 팔로워 · 6억 수익을 만든 비법을<br/>
                100% 무료 라이브로 공개합니다.
              </p>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl">
              <LiveSignupForm />
            </div>

            <ul className="mt-6 space-y-2 text-[13px] sm:text-sm text-white/55">
              {[
                "참가비 없음 · 누구나 신청 가능",
                "신청 즉시 이메일로 입장 링크 발송",
                "라이브 참여자 한정 특별 선물 증정 🎁",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full ig-gradient shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ===== 강사 실적 ===== */}
        <section className="relative px-4 sm:px-6 pb-16">
          <div className="max-w-3xl mx-auto">
            <p className="text-center text-[11px] sm:text-xs font-bold text-amber-300 tracking-[3px] mb-2">
              REAL ACHIEVEMENT
            </p>
            <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 leading-tight">
              <span className="ig-gradient-text">1년 만에</span> 만든 결과
            </h2>
            <p className="text-center text-sm text-white/55 mb-8">
              저도 처음엔 팔로워 0명이었습니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ACHIEVEMENTS.map(({ icon: Icon, label, value, desc }) => (
                <div key={label} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 text-center">
                  <Icon className="w-5 h-5 text-amber-300 mx-auto mb-3" />
                  <div className="text-3xl sm:text-3xl font-black ig-gradient-text mb-1">{value}</div>
                  <div className="text-xs text-white/60 font-medium">{label} <span className="text-white/35">· {desc}</span></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 라이브 내용 ===== */}
        <section className="relative px-4 sm:px-6 pb-16">
          <div className="max-w-2xl mx-auto">
            <p className="text-center text-[11px] sm:text-xs font-bold text-pink-300 tracking-[3px] mb-2">
              LIVE TOPICS
            </p>
            <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
              라이브에서 이걸<br className="sm:hidden"/> <span className="ig-gradient-text">알려드립니다</span>
            </h2>
            <p className="text-center text-sm text-white/55 mb-8 leading-relaxed">
              평범한 사람이 인스타그램으로<br className="sm:hidden"/>
              <span className="hidden sm:inline"> </span>노출·팔로워·매출을 만드는 실전 공식.
            </p>

            <div className="space-y-3">
              {LIVE_TOPICS.map((t, i) => (
                <div key={t.title} className="flex gap-4 bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                  <div className="shrink-0 w-9 h-9 rounded-xl ig-gradient flex items-center justify-center text-white font-black text-sm">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">{t.title}</h3>
                    <p className="text-[13px] sm:text-sm text-white/60 leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 라이브 참여자 한정 혜택 ===== */}
        <section className="relative px-4 sm:px-6 pb-16">
          <div className="max-w-2xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 ig-gradient opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/40" />
              <div className="relative p-6 sm:p-10 text-white">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-bold tracking-wider mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  LIVE 참여자 한정 선물
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-[34px] font-black leading-[1.2] mb-3">
                  인스타그램 수익화 시<br/>
                  반드시 알아야 하는<br/>
                  <span className="text-yellow-100">핵심 10가지 질문 & 답변</span>
                </h2>
                <p className="text-sm sm:text-base text-white/85 leading-relaxed mb-5">
                  실제 수강생들이 가장 많이 막힌 10개의 핵심 질문과<br className="hidden sm:block"/>
                  검증된 답변을 한 권의 책으로 정리했습니다.<br/>
                  <strong className="text-yellow-100">라이브 참여자에게만</strong> 무료로 보내드립니다.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/30 backdrop-blur-sm text-sm font-semibold">
                  <BookOpen className="w-4 h-4 text-yellow-100" />
                  E-Book · 비매품
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 마지막 CTA ===== */}
        <section className="relative px-4 sm:px-6 pb-20">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 leading-tight">
              <span className="ig-gradient-text">지금 신청</span>하고<br/>
              라이브에서 만나요
            </h2>
            <p className="text-sm text-white/55 mb-6">
              위 폼으로 1분만에 신청 완료. 즉시 이메일로 입장 링크 발송.
            </p>
            <a
              href="#signup"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl ig-gradient text-white font-bold text-sm shadow-lg shadow-pink-900/30 active:opacity-90"
            >
              ↑ 신청 폼으로 이동
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
