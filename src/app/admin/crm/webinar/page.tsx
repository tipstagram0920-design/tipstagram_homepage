import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Plus, Calendar, Send, BarChart3 } from "lucide-react";
import { WebinarToggle } from "./WebinarToggle";

export const dynamic = "force-dynamic";

export default async function WebinarListPage() {
  const campaigns = await prisma.webinarCampaign.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { sends: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">웨비나 캠페인</h1>
          <p className="text-sm text-neutral-500 mt-1">라이브 날짜 기준 카운트다운 자동 메일 시퀀스</p>
        </div>
        <Link
          href="/admin/crm/webinar/new"
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl ig-gradient text-white hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> 새 캠페인
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center">
          <Calendar className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-600 mb-1">아직 캠페인이 없습니다.</p>
          <p className="text-sm text-neutral-400 mb-5">라이브 날짜를 입력하면 D-10 / D-7 / D-3 ... 자동 메일을 보낼 수 있어요.</p>
          <Link href="/admin/crm/webinar/new" className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl ig-gradient text-white">
            <Plus className="w-4 h-4" /> 첫 캠페인 만들기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => {
            const stepsCount = Array.isArray(c.steps) ? c.steps.length : 0;
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/admin/crm/webinar/${c.id}`} className="font-bold text-neutral-900 hover:text-pink-500 truncate">
                      {c.name}
                    </Link>
                    {c.isActive ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">활성</span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">비활성</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> 라이브 {formatDate(c.webinarDate)}
                    </span>
                    {c.endDate && <span>· 마감 {formatDate(c.endDate)}</span>}
                    <span>· {stepsCount} step</span>
                    <span className="inline-flex items-center gap-1">
                      <Send className="w-3 h-3" /> {c._count.sends}건 발송
                    </span>
                  </div>
                </div>
                <WebinarToggle id={c.id} initial={c.isActive} />
                <Link
                  href={`/admin/crm/webinar/${c.id}/activity`}
                  className="px-3.5 py-2 rounded-xl border border-pink-200 text-xs font-semibold text-pink-600 hover:bg-pink-50 inline-flex items-center gap-1.5"
                >
                  <BarChart3 className="w-3.5 h-3.5" /> 활동 현황
                </Link>
                <Link
                  href={`/admin/crm/webinar/${c.id}/edit`}
                  className="px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:border-pink-300 hover:text-pink-500"
                >
                  편집
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
