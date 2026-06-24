import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { COMPANY } from "@/lib/company";
import { FreebieSignupForm } from "./FreebieSignupForm";
import { BookOpen, Download, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const freebie = await prisma.freebie.findUnique({ where: { slug } });
  if (!freebie) return { title: "자료를 찾을 수 없습니다" };
  return {
    title: `${freebie.title} - ${COMPANY.serviceName}`,
    description: freebie.subtitle || `${freebie.title} 무료 다운로드`,
  };
}

export default async function FreebiePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const freebie = await prisma.freebie.findUnique({ where: { slug } });
  if (!freebie || !freebie.isActive) notFound();

  return (
    <>
      <Navbar />
      <main className="bg-neutral-950 overflow-hidden">
        <section className="relative pt-24 pb-16">
          <div className="absolute -top-32 -left-32 w-[420px] h-[420px] sm:w-[520px] sm:h-[520px] rounded-full opacity-25 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #833ab4, transparent 70%)" }} />
          <div className="absolute top-1/3 -right-24 w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #fd1d1d, transparent 70%)" }} />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #fcaf45, transparent 70%)" }} />

          <div className="relative max-w-xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-[11px] sm:text-xs font-semibold mb-5">
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                무료 자료 · 이메일 즉시 발송
              </div>
              <h1 className="text-[28px] leading-[1.2] sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                <span className="ig-gradient-text">{freebie.title}</span>
              </h1>
              {freebie.subtitle && (
                <p className="text-base sm:text-lg text-white/65 leading-relaxed mb-2">
                  {freebie.subtitle}
                </p>
              )}
              {freebie.description && (
                <p className="text-sm text-white/55 leading-relaxed whitespace-pre-wrap">
                  {freebie.description}
                </p>
              )}
            </div>

            {freebie.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={freebie.thumbnail}
                alt={freebie.title}
                className="w-full max-w-sm mx-auto rounded-2xl border border-white/10 mb-8 shadow-2xl"
              />
            )}

            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl">
              {freebie.fileUrl ? (
                <FreebieSignupForm slug={freebie.slug} />
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold mb-4">
                    🛠 자료 준비 중
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white mb-2">곧 공개될 예정입니다</h2>
                  <p className="text-sm text-white/55 leading-relaxed">
                    파일 업로드가 완료되면 이 페이지에서 바로 신청하실 수 있습니다.
                  </p>
                </div>
              )}
            </div>

            <ul className="mt-6 space-y-2 text-[13px] sm:text-sm text-white/55">
              <li className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-amber-300" />
                신청 즉시 입력하신 이메일로 자료가 발송돼요
              </li>
              <li className="flex items-center gap-2.5">
                <Download className="w-3.5 h-3.5 text-amber-300" />
                참가비 0원 · 누구나 신청 가능
              </li>
              {freebie.showLivePromo && (
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full ig-gradient shrink-0" />
                  이메일에 <strong className="text-white/80">무료 라이브</strong> 초대장도 함께 보내드려요
                </li>
              )}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
