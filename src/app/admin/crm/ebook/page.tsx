import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Mail, Image as ImageIcon, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EbookSubmissionsPage() {
  const [step1Count, step2Count, subs] = await Promise.all([
    prisma.ebookSubmission.count({ where: { level: 1 } }),
    prisma.ebookSubmission.count({ where: { level: 2 } }),
    prisma.ebookSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { contact: { select: { id: true, name: true } } },
    }),
  ]);

  const conversionRate = step1Count > 0 ? Math.round((step2Count / step1Count) * 100) : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-neutral-900">전자책 신청</h1>
        <p className="text-sm text-neutral-500 mt-1">1차 신청·2차 인증 제출 통합 리스트</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-neutral-500">1차 신청 (전체 기간)</p>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900">{step1Count.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-neutral-500">2차 인증 제출</p>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900">{step2Count.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-neutral-500">전환율 (2차 / 1차)</p>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-black ig-gradient-text">{conversionRate}%</div>
        </div>
      </div>

      {/* 리스트 */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 bg-neutral-50 border-b border-neutral-100 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          <div className="col-span-1">단계</div>
          <div className="col-span-3">이름</div>
          <div className="col-span-3">이메일</div>
          <div className="col-span-2">스크린샷</div>
          <div className="col-span-3">신청 시각</div>
        </div>
        {subs.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-neutral-400">아직 신청이 없습니다.</div>
        ) : (
          subs.map((s) => (
            <div key={s.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 px-5 py-3.5 items-center border-b border-neutral-50 last:border-0 hover:bg-neutral-50">
              <div className="md:col-span-1">
                <span
                  className={
                    "inline-block text-[10px] font-bold px-2 py-0.5 rounded-full " +
                    (s.level === 1
                      ? "bg-pink-50 text-pink-600"
                      : "bg-amber-50 text-amber-700")
                  }
                >
                  {s.level === 1 ? "1차" : "2차"}
                </span>
              </div>
              <div className="md:col-span-3 text-sm font-medium text-neutral-900 truncate">
                {s.contact ? (
                  <Link href={`/admin/crm/contacts/${s.contact.id}`} className="hover:text-pink-500">
                    {s.name || s.contact.name || "이름 없음"}
                  </Link>
                ) : (
                  s.name || "이름 없음"
                )}
              </div>
              <div className="md:col-span-3 text-sm text-neutral-500 truncate">{s.email}</div>
              <div className="md:col-span-2">
                {s.screenshotUrl ? (
                  <a href={s.screenshotUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-pink-600 hover:text-pink-700 font-medium">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.screenshotUrl} alt="" className="w-10 h-10 rounded-md object-cover border border-neutral-200" />
                    <span>보기</span>
                  </a>
                ) : (
                  <span className="text-xs text-neutral-300">-</span>
                )}
              </div>
              <div className="md:col-span-3 text-xs text-neutral-400">{formatDate(s.createdAt)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
