import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { COMPANY } from "@/lib/company";
import { HelpCircle, MessageCircle, Sparkles } from "lucide-react";
import { WebinarAskForm } from "./WebinarAskForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}): Promise<Metadata> {
  const { campaignId } = await params;
  const c = await prisma.webinarCampaign.findUnique({ where: { id: campaignId } });
  return {
    title: `사전 질문 보내기 — ${c?.name || COMPANY.serviceName}`,
    description: "라이브에서 직접 답해드릴 질문을 미리 보내주세요.",
  };
}

export default async function WebinarAskPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  const campaign = await prisma.webinarCampaign.findUnique({
    where: { id: campaignId },
    select: { id: true, name: true, webinarDate: true },
  });
  if (!campaign) notFound();

  const kst = new Date(campaign.webinarDate.getTime() + 9 * 60 * 60 * 1000);
  const month = kst.getUTCMonth() + 1;
  const day = kst.getUTCDate();
  const hour = kst.getUTCHours();
  const ampm = hour < 12 ? "오전" : "오후";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const dateStr = `${month}월 ${day}일 ${ampm} ${h12}시`;

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
                <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
                {dateStr} 무료 라이브 · 사전 질문
              </div>
              <h1 className="text-[26px] sm:text-4xl font-black text-white mb-3 leading-[1.25] tracking-tight">
                <span className="ig-gradient-text">가장 궁금한 것</span> 하나만<br/>미리 알려주세요
              </h1>
              <p className="text-sm sm:text-base text-white/60 leading-relaxed">
                라이브에서 익명으로 직접 답해드릴게요.<br/>
                길게 안 쓰셔도 좋아요. 한 줄이면 충분합니다.
              </p>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl">
              <WebinarAskForm campaignId={campaign.id} />
            </div>

            <ul className="mt-6 space-y-2 text-[13px] text-white/55">
              <li className="flex items-center gap-2.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                답변은 라이브에서 익명으로 진행돼요
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-3.5 h-3.5 text-amber-300" />
                여러 질문을 받아도 시간 안에 가장 많이 겹치는 것부터
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
