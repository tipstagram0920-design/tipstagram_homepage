import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Calendar, Send, CheckCircle2, XCircle } from "lucide-react";
import { computeFireAt, type WebinarStep } from "@/lib/crm/webinar-engine";
import { PreQuestionCard } from "./PreQuestionCard";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://tipstagram-homepage.vercel.app";

export const dynamic = "force-dynamic";

export default async function WebinarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await prisma.webinarCampaign.findUnique({ where: { id } });
  if (!c) notFound();

  const [sends, questionCount] = await Promise.all([
    prisma.webinarCampaignSend.findMany({
      where: { campaignId: id },
      orderBy: { sentAt: "desc" },
      take: 100,
    }),
    prisma.webinarQuestion.count({ where: { campaignId: id } }),
  ]);

  const sendStats = sends.reduce(
    (acc, s) => {
      acc[s.stepIndex] = acc[s.stepIndex] || { sent: 0, failed: 0 };
      if (s.status === "sent") acc[s.stepIndex].sent++;
      else if (s.status === "failed") acc[s.stepIndex].failed++;
      return acc;
    },
    {} as Record<number, { sent: number; failed: number }>
  );

  const steps = (c.steps as unknown[] as WebinarStep[]) ?? [];
  const now = new Date();

  return (
    <div>
      <Link href="/admin/crm/webinar" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> 캠페인 목록
      </Link>

      <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-neutral-900">{c.name}</h1>
              {c.isActive ? (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">활성</span>
              ) : (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">비활성</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-500 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> 라이브 {formatDate(c.webinarDate)}
              </span>
              {c.endDate && <span>· 마감 {formatDate(c.endDate)}</span>}
              <span>· 총 발송 {sends.length}건</span>
            </div>
          </div>
          <Link href={`/admin/crm/webinar/${id}/edit`} className="px-4 py-2 rounded-xl ig-gradient text-white text-sm font-bold">
            편집
          </Link>
        </div>
      </div>

      {/* 사전 질문 페이지 카드 (URL + 복사 + 열기 + 리스트 링크) */}
      <PreQuestionCard
        campaignId={id}
        questionCount={questionCount}
        url={c.preQuestionUrl || `${SITE}/webinar/ask/${id}`}
      />

      {/* Step 별 발송 현황 */}
      <h2 className="text-lg font-bold text-neutral-900 mb-3">Step별 발송 현황</h2>
      <div className="space-y-2 mb-8">
        {steps.length === 0 && <p className="text-sm text-neutral-400 text-center py-6 bg-white border border-neutral-100 rounded-2xl">step이 없습니다.</p>}
        {steps.map((s, idx) => {
          const fireAt = computeFireAt(s, c.webinarDate, c.endDate);
          const stat = sendStats[idx] ?? { sent: 0, failed: 0 };
          const isPast = fireAt && fireAt < now;
          const label =
            s.kind === "webinar"
              ? s.offsetDays === 0 ? "라이브 당일" : s.offsetDays < 0 ? `라이브 D${s.offsetDays}` : `라이브 D+${s.offsetDays}`
              : s.offsetDays === 0 ? "마감 당일" : s.offsetDays < 0 ? `마감 D${s.offsetDays}` : `마감 D+${s.offsetDays}`;
          return (
            <div key={idx} className="bg-white rounded-2xl border border-neutral-100 p-4 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full ig-gradient flex items-center justify-center text-white text-xs font-black shrink-0">{idx + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-900 truncate">{s.subject || "(제목 없음)"}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {label} · {s.time} KST · 발송 시각 {fireAt ? formatDate(fireAt) : "—"}
                </p>
              </div>
              <div className="text-right shrink-0">
                {isPast ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">발송됨</span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">대기</span>
                )}
                <div className="text-xs text-neutral-500 mt-1.5 inline-flex items-center gap-2">
                  <span className="inline-flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" />{stat.sent}</span>
                  {stat.failed > 0 && <span className="inline-flex items-center gap-0.5"><XCircle className="w-3 h-3 text-red-500" />{stat.failed}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 최근 발송 이력 */}
      <h2 className="text-lg font-bold text-neutral-900 mb-3">최근 발송 100건</h2>
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        {sends.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-neutral-400">아직 발송 기록이 없습니다.</div>
        ) : (
          sends.map((s) => (
            <div key={s.id} className="grid grid-cols-12 gap-2 px-5 py-3 items-center border-b border-neutral-50 last:border-0 text-sm">
              <div className="col-span-2 inline-flex items-center gap-1.5">
                <Send className="w-3 h-3 text-neutral-400" />
                <span className="font-semibold">step {s.stepIndex + 1}</span>
              </div>
              <div className="col-span-3 font-mono text-xs text-neutral-500 truncate">{s.contactId}</div>
              <div className="col-span-2">
                {s.status === "sent" ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">SENT</span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500">FAILED</span>
                )}
              </div>
              <div className="col-span-3 text-xs text-red-500 truncate">{s.error || ""}</div>
              <div className="col-span-2 text-xs text-neutral-400">{formatDate(s.sentAt)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
