import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { computeFireAt, type WebinarStep } from "@/lib/crm/webinar-engine";
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://tipstagram-homepage.vercel.app";

export default async function CampaignActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await prisma.webinarCampaign.findUnique({ where: { id } });
  if (!c) notFound();

  const [sends, questions, drafts, messageLogs] = await Promise.all([
    prisma.webinarCampaignSend.findMany({
      where: { campaignId: id },
      orderBy: { sentAt: "desc" },
    }),
    prisma.webinarQuestion.findMany({
      where: { campaignId: id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.broadcastDraft.findMany({
      where: { notes: { contains: `[campaign:${id}:` } },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.messageLog.findMany({
      where: { templateKey: { startsWith: `webinar_${id}_` } },
      orderBy: { sentAt: "desc" },
      take: 100,
    }),
  ]);

  const steps = (c.steps as unknown[] as WebinarStep[]) ?? [];
  const now = new Date();

  // step별 발송 통계
  const sendStats: Record<number, { sent: number; failed: number }> = {};
  for (const s of sends) {
    sendStats[s.stepIndex] = sendStats[s.stepIndex] || { sent: 0, failed: 0 };
    if (s.status === "sent") sendStats[s.stepIndex].sent++;
    else if (s.status === "failed") sendStats[s.stepIndex].failed++;
  }

  const totalSent = sends.filter((s) => s.status === "sent").length;
  const totalFailed = sends.filter((s) => s.status === "failed").length;
  const kakaoScheduled = drafts.filter((d) => d.status === "scheduled").length;
  const kakaoNotified = drafts.filter((d) => d.status === "notified").length;
  const kakaoDone = drafts.filter((d) => d.status === "done").length;

  return (
    <div className="max-w-5xl">
      <Link
        href={`/admin/crm/webinar/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-pink-500 mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> {c.name}
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-neutral-900">캠페인 활동 현황</h1>
        <p className="text-sm text-neutral-500 mt-1">
          이 캠페인의 메일 · 카톡 · 사전 질문이 어떻게 진행 중인지 한눈에.
        </p>
      </div>

      {/* KPI 3장 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <SummaryCard
          icon={Mail}
          label="메일"
          primary={`발송 ${totalSent}건`}
          secondary={
            totalFailed > 0 ? `실패 ${totalFailed}건` : `실패 없음`
          }
          tone="from-blue-500 to-indigo-500"
        />
        <SummaryCard
          icon={MessageCircle}
          label="카톡 예약"
          primary={`${drafts.length}건 시드됨`}
          secondary={`예약 ${kakaoScheduled} · 알림 ${kakaoNotified} · 완료 ${kakaoDone}`}
          tone="from-yellow-500 to-amber-500"
        />
        <SummaryCard
          icon={MessageSquare}
          label="사전 질문"
          primary={`${questions.length}건 수신`}
          secondary={
            questions.length > 0
              ? `최근 ${formatDate(questions[0].createdAt)}`
              : "아직 없음"
          }
          tone="from-purple-500 to-pink-500"
        />
      </div>

      {/* 메일 시퀀스 */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-neutral-900">메일 시퀀스</h2>
          <span className="text-xs text-neutral-500">
            총 {steps.length} step · 발송 {totalSent}건
          </span>
        </div>
        {steps.length === 0 ? (
          <div className="bg-white border border-neutral-100 rounded-2xl p-6 text-center text-sm text-neutral-400">
            아직 step이 없습니다.
          </div>
        ) : (
          <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden">
            {steps.map((s, idx) => {
              const fireAt = computeFireAt(s, c.webinarDate, c.endDate);
              const stat = sendStats[idx] ?? { sent: 0, failed: 0 };
              const isPast = fireAt && fireAt < now;
              const label =
                s.kind === "webinar"
                  ? s.offsetDays === 0
                    ? "라이브 당일"
                    : s.offsetDays < 0
                    ? `라이브 D${s.offsetDays}`
                    : `라이브 D+${s.offsetDays}`
                  : s.offsetDays === 0
                  ? "마감 당일"
                  : s.offsetDays < 0
                  ? `마감 D${s.offsetDays}`
                  : `마감 D+${s.offsetDays}`;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-5 py-3 border-b border-neutral-50 last:border-0"
                >
                  <span className="w-7 h-7 rounded-full ig-gradient flex items-center justify-center text-white text-xs font-black shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-neutral-800 truncate">
                      {s.subject || "(제목 없음)"}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {label} · {s.time} · {fireAt ? formatDate(fireAt) : "-"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {stat.sent > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" />
                        {stat.sent}
                      </span>
                    )}
                    {stat.failed > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500 ml-2">
                        <XCircle className="w-3 h-3" />
                        {stat.failed}
                      </span>
                    )}
                    {stat.sent === 0 && stat.failed === 0 && (
                      <span
                        className={
                          "text-xs " +
                          (isPast ? "text-neutral-400" : "text-neutral-400")
                        }
                      >
                        {isPast ? "발송 대기" : "예정"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 카톡 예약 */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-neutral-900">카톡 예약 (BroadcastDraft)</h2>
          <Link
            href="/admin/crm/broadcast"
            className="text-xs font-semibold text-pink-600 hover:text-pink-700 inline-flex items-center gap-1"
          >
            예약 보드에서 편집 <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        {drafts.length === 0 ? (
          <div className="bg-white border border-neutral-100 rounded-2xl p-6 text-center text-sm text-neutral-400">
            아직 시드된 카톡 메시지가 없어요. 캠페인 편집 화면의 "12개 예약 시드" 버튼을 눌러주세요.
          </div>
        ) : (
          <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden">
            {drafts.map((d) => {
              const isPast = d.scheduledAt < now;
              const stepMatch = d.notes?.match(/:step:(\d+)/);
              const stepIdx = stepMatch ? parseInt(stepMatch[1], 10) : null;
              return (
                <div
                  key={d.id}
                  className="flex items-center gap-3 px-5 py-3 border-b border-neutral-50 last:border-0"
                >
                  <StatusPill status={d.status} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-neutral-800 truncate">
                      {stepIdx !== null && (
                        <span className="text-xs font-bold text-neutral-400 mr-1.5">
                          #{stepIdx + 1}
                        </span>
                      )}
                      {d.title}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      <Clock className="inline w-3 h-3 mr-1 mb-0.5" />
                      {formatDate(d.scheduledAt)}
                      {isPast && d.status === "scheduled" && (
                        <span className="ml-2 text-amber-600 font-semibold">
                          시각 지남 (10분 내 운영자 알림 예정)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 사전 질문 */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-neutral-900">사전 질문</h2>
          <Link
            href={`/admin/crm/webinar/${id}/questions`}
            className="text-xs font-semibold text-pink-600 hover:text-pink-700"
          >
            전체 질문 리스트 →
          </Link>
        </div>
        {questions.length === 0 ? (
          <div className="bg-white border border-neutral-100 rounded-2xl p-6 text-center text-sm text-neutral-400">
            아직 사전 질문이 없어요.{" "}
            <a
              href={`${SITE}/webinar/ask/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 underline"
            >
              공개 페이지
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {questions.slice(0, 5).map((q) => (
              <div
                key={q.id}
                className="bg-white border border-neutral-100 rounded-2xl px-5 py-3"
              >
                <div className="flex items-center gap-3 text-xs text-neutral-500 mb-1.5">
                  <span className="font-semibold text-neutral-700">
                    {q.name || "(익명)"}
                  </span>
                  <span className="text-neutral-300">·</span>
                  <span>{formatDate(q.createdAt)}</span>
                </div>
                <p className="text-sm text-neutral-800 line-clamp-2 whitespace-pre-wrap">
                  {q.question}
                </p>
              </div>
            ))}
            {questions.length > 5 && (
              <p className="text-xs text-neutral-500 text-center pt-2">
                외 {questions.length - 5}건 —
                <Link
                  href={`/admin/crm/webinar/${id}/questions`}
                  className="text-pink-600 font-semibold ml-1"
                >
                  전체 보기
                </Link>
              </p>
            )}
          </div>
        )}
      </section>

      {/* 최근 실제 발송 로그 (MessageLog) */}
      {messageLogs.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-neutral-900 mb-3 inline-flex items-center gap-1.5">
            <Send className="w-4 h-4" /> 최근 실제 발송 (MessageLog)
          </h2>
          <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden">
            {messageLogs.slice(0, 20).map((l) => (
              <div
                key={l.id}
                className="flex items-center gap-3 px-5 py-2.5 border-b border-neutral-50 last:border-0 text-xs"
              >
                <span
                  className={
                    "font-bold " +
                    (l.status === "sent"
                      ? "text-emerald-600"
                      : "text-red-500")
                  }
                >
                  {l.status}
                </span>
                <span className="text-neutral-700 truncate flex-1">{l.to}</span>
                <span className="text-neutral-500 truncate max-w-xs">
                  {l.subject || l.templateKey || "-"}
                </span>
                <span className="text-neutral-400 whitespace-nowrap">
                  {formatDate(l.sentAt)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  primary,
  secondary,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  primary: string;
  secondary: string;
  tone: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tone} flex items-center justify-center`}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
        <p className="text-xs font-semibold text-neutral-500">{label}</p>
      </div>
      <p className="text-xl font-black text-neutral-900">{primary}</p>
      <p className="text-xs text-neutral-500 mt-1">{secondary}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    scheduled: {
      label: "예약",
      className: "bg-neutral-100 text-neutral-600",
    },
    notified: {
      label: "알림 전송됨",
      className: "bg-amber-50 text-amber-700 border border-amber-200",
    },
    done: {
      label: "발송 완료",
      className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    },
  };
  const s = map[status] || {
    label: status,
    className: "bg-neutral-100 text-neutral-600",
  };
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${s.className}`}
    >
      {s.label}
    </span>
  );
}
