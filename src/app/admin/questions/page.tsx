import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { instagramHandle } from "@/lib/webinar-question";
import {
  MessageSquare,
  User as UserIcon,
  Mail,
  Clock,
  Instagram,
  Briefcase,
  Tag,
  Search,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function AllQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; campaign?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const keyword = (sp.q || "").trim();
  const campaignId = sp.campaign || "";
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.WebinarQuestionWhereInput = {};
  if (campaignId) where.campaignId = campaignId;
  if (keyword) {
    where.OR = [
      { question: { contains: keyword, mode: "insensitive" } },
      { name: { contains: keyword, mode: "insensitive" } },
      { email: { contains: keyword, mode: "insensitive" } },
      { industry: { contains: keyword, mode: "insensitive" } },
      { accountCategory: { contains: keyword, mode: "insensitive" } },
    ];
  }

  const [campaigns, total, questions] = await Promise.all([
    prisma.webinarCampaign.findMany({
      orderBy: { webinarDate: "desc" },
      select: { id: true, name: true, webinarDate: true },
    }),
    prisma.webinarQuestion.count({ where }),
    prisma.webinarQuestion.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { campaign: { select: { id: true, name: true } } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const isFiltered = !!(keyword || campaignId);

  const pageHref = (n: number) => {
    const p = new URLSearchParams();
    if (keyword) p.set("q", keyword);
    if (campaignId) p.set("campaign", campaignId);
    if (n > 1) p.set("page", String(n));
    const qs = p.toString();
    return qs ? `/admin/questions?${qs}` : "/admin/questions";
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-neutral-900">들어온 질문</h1>
        <p className="text-sm text-neutral-500 mt-1">
          라이브 사전 질문 페이지로 접수된 질문을 모두 모아 봅니다. 총{" "}
          <strong className="text-neutral-800">{total}건</strong>
          {isFiltered && " (필터 적용)"}
        </p>
      </div>

      {/* 필터 */}
      <form method="get" className="bg-white rounded-2xl border border-neutral-100 p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              name="q"
              defaultValue={keyword}
              placeholder="질문 내용 · 이름 · 이메일 · 업종으로 검색"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>
          <select
            name="campaign"
            defaultValue={campaignId}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:border-pink-400 sm:w-64"
          >
            <option value="">전체 캠페인</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            검색
          </button>
          {isFiltered && (
            <Link
              href="/admin/questions"
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 text-center"
            >
              초기화
            </Link>
          )}
        </div>
      </form>

      {questions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center">
          <MessageSquare className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-600 mb-1">
            {isFiltered ? "조건에 맞는 질문이 없어요." : "아직 들어온 질문이 없어요."}
          </p>
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
                <Link
                  href={`/admin/crm/webinar/${q.campaign.id}/questions`}
                  className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-2 py-0.5 font-semibold text-neutral-600 hover:bg-neutral-200"
                >
                  <Calendar className="w-3 h-3" /> {q.campaign.name}
                </Link>
                {q.contactId && (
                  <Link
                    href={`/admin/crm/contacts/${q.contactId}`}
                    className="text-pink-600 hover:text-pink-700 font-semibold"
                  >
                    컨택트 보기 →
                  </Link>
                )}
              </div>

              {(q.instagramUrl || q.accountCategory || q.industry) && (
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {q.instagramUrl && (
                    <a
                      href={q.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-pink-50 px-2 py-1 text-[11px] font-bold text-pink-600 hover:bg-pink-100"
                    >
                      <Instagram className="w-3 h-3" /> {instagramHandle(q.instagramUrl)}
                    </a>
                  )}
                  {q.accountCategory && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-2 py-1 text-[11px] font-bold text-neutral-600">
                      <Tag className="w-3 h-3" /> {q.accountCategory}
                    </span>
                  )}
                  {q.industry && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-2 py-1 text-[11px] font-bold text-neutral-600">
                      <Briefcase className="w-3 h-3" /> {q.industry}
                    </span>
                  )}
                </div>
              )}

              <p className="text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">
                {q.question}
              </p>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <Link
              href={pageHref(page - 1)}
              className="px-4 py-2 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
            >
              이전
            </Link>
          )}
          <span className="text-sm text-neutral-500">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={pageHref(page + 1)}
              className="px-4 py-2 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
            >
              다음
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
