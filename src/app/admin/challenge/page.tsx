import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatKstHuman } from "@/lib/kst";
import { Trophy, Plus, ArrowRight, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ChallengeAdminPage() {
  const cohorts = await prisma.challengeCohort.findMany({
    orderBy: { week1StartAt: "desc" },
    include: {
      _count: { select: { weeks: true } },
    },
  });

  // 각 cohort의 참여자 수(=Purchase count)를 함께 계산
  const enrolledCounts = await Promise.all(
    cohorts.map((c) =>
      prisma.purchase.count({
        where: { refundedAt: null, product: { slug: c.productSlug } },
      })
    )
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-black text-neutral-900 inline-flex items-center gap-2">
          <Trophy className="w-6 h-6 text-pink-500" />
          5주 챌린지
        </h1>
        <Link
          href="/admin/challenge/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> 새 기수
        </Link>
      </div>
      <p className="text-sm text-neutral-500 mb-8">
        기수별로 5주 챌린지를 운영합니다. 각 주차마다 숙제 프롬프트·라이브 URL을 세팅하면 참여자에게 오픈 알림이 자동 발송됩니다.
      </p>

      {cohorts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
          <Trophy className="mx-auto w-10 h-10 text-neutral-300 mb-3" />
          <p className="text-neutral-500 mb-4">아직 만들어진 기수가 없어요.</p>
          <Link
            href="/admin/challenge/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> 첫 기수 만들기
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {cohorts.map((c, i) => (
            <li key={c.id}>
              <Link
                href={`/admin/challenge/${c.id}`}
                className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-5 hover:border-pink-300 hover:bg-pink-50/30 transition-colors"
              >
                <div
                  className={
                    "shrink-0 w-12 h-12 rounded-xl flex items-center justify-center " +
                    (c.isActive ? "ig-gradient text-white" : "bg-neutral-100 text-neutral-400")
                  }
                >
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-neutral-900 truncate">{c.name}</p>
                    {!c.isActive && (
                      <span className="text-[10px] font-bold text-neutral-400 border border-neutral-200 rounded px-1.5 py-0.5">
                        비활성
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {c.productSlug} · Week 1 오픈 {formatKstHuman(c.week1StartAt)}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1 inline-flex items-center gap-3">
                    <span>주차 {c._count.weeks} / {c.weeksTotal}</span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3 h-3" /> 참여자 {enrolledCounts[i]}명
                    </span>
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-300" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
