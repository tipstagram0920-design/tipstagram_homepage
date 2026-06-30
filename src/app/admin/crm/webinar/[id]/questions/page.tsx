import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, MessageSquare, User as UserIcon, Mail, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function WebinarQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await prisma.webinarCampaign.findUnique({
    where: { id },
    select: { id: true, name: true, webinarDate: true },
  });
  if (!campaign) notFound();

  const questions = await prisma.webinarQuestion.findMany({
    where: { campaignId: id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <Link
        href={`/admin/crm/webinar/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-pink-500 mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> {campaign.name}
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">사전 질문</h1>
          <p className="text-sm text-neutral-500 mt-1">
            라이브 신청자가 보낸 질문 <strong>{questions.length}건</strong>
          </p>
        </div>
        <a
          href={`/webinar/ask/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-pink-600 hover:text-pink-700"
        >
          공개 페이지 열기 →
        </a>
      </div>

      {questions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center">
          <MessageSquare className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-600 mb-1">아직 질문이 없어요.</p>
          <p className="text-xs text-neutral-400">
            메일·카톡 메시지에 사전 질문 페이지 링크가 자동 포함됩니다.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <div key={q.id} className="bg-white rounded-2xl border border-neutral-100 p-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 mb-3">
                <span className="inline-flex items-center gap-1">
                  <UserIcon className="w-3 h-3" /> {q.name || "(이름 없음)"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {q.email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatDate(q.createdAt)}
                </span>
                {q.contactId && (
                  <Link
                    href={`/admin/crm/contacts/${q.contactId}`}
                    className="text-pink-600 hover:text-pink-700 font-semibold"
                  >
                    컨택트 보기 →
                  </Link>
                )}
              </div>
              <p className="text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">{q.question}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
