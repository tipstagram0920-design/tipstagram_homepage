import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Users as UsersIcon, ShoppingBag, Mail, Activity, TrendingUp, RotateCcw } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getKpis() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const start30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const start7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalContacts,
    activeContacts,
    monthSignups,
    monthRegisters,
    monthPurchases,
    monthRevenue,
    repeatBuyers,
    totalBuyers,
    yesterdaySent,
    weekUnsubs,
    weekNewContacts,
    activeWorkflows,
    pendingRuns,
  ] = await Promise.all([
    prisma.contact.count(),
    prisma.contact.count({ where: { lastSeenAt: { gte: start30 } } }),
    prisma.event.count({ where: { type: "live_signup", occurredAt: { gte: startOfMonth } } }),
    prisma.event.count({ where: { type: "register", occurredAt: { gte: startOfMonth } } }),
    prisma.event.count({ where: { type: "purchase", occurredAt: { gte: startOfMonth } } }),
    prisma.purchase.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startOfMonth } } }),
    prisma.contact.count({ where: { purchaseCount: { gte: 2 } } }),
    prisma.contact.count({ where: { purchaseCount: { gte: 1 } } }),
    prisma.messageLog.count({
      where: {
        sentAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        status: "sent",
      },
    }),
    prisma.contact.count({ where: { unsubscribedAt: { gte: startOfWeek } } }),
    prisma.contact.count({ where: { firstSeenAt: { gte: start7 } } }),
    prisma.workflow.count({ where: { isActive: true } }),
    prisma.workflowRun.count({ where: { status: "pending" } }),
  ]);

  return {
    totalContacts,
    activeContacts,
    monthSignups,
    monthRegisters,
    monthPurchases,
    monthRevenue: monthRevenue._sum.amount ?? 0,
    repeatRate: totalBuyers ? Math.round((repeatBuyers / totalBuyers) * 100) : 0,
    yesterdaySent,
    weekUnsubs,
    weekNewContacts,
    activeWorkflows,
    pendingRuns,
  };
}

export default async function CrmDashboardPage() {
  const k = await getKpis();

  const cards = [
    {
      title: "이번 달 퍼널",
      value: `${k.monthSignups} → ${k.monthRegisters} → ${k.monthPurchases}`,
      sub: "라이브신청 → 가입 → 구매",
      icon: TrendingUp,
      tone: "from-pink-500 to-orange-400",
    },
    {
      title: "활성 컨택트 (30일)",
      value: `${k.activeContacts.toLocaleString()} / ${k.totalContacts.toLocaleString()}`,
      sub: "lastSeen 기준",
      icon: UsersIcon,
      tone: "from-purple-500 to-pink-500",
    },
    {
      title: "이번 달 매출",
      value: formatPrice(k.monthRevenue),
      sub: `${k.monthPurchases}건`,
      icon: ShoppingBag,
      tone: "from-amber-500 to-red-500",
    },
    {
      title: "반복 구매율",
      value: `${k.repeatRate}%`,
      sub: "2회 이상 구매 / 전체 구매자",
      icon: RotateCcw,
      tone: "from-emerald-500 to-cyan-500",
    },
    {
      title: "어제 메시지 발송",
      value: k.yesterdaySent.toLocaleString(),
      sub: "성공한 발송 건수",
      icon: Mail,
      tone: "from-blue-500 to-indigo-500",
    },
    {
      title: "이번 주 수신거부",
      value: k.weekUnsubs.toLocaleString(),
      sub: "구독 해지",
      icon: Activity,
      tone: "from-rose-500 to-pink-500",
    },
    {
      title: "최근 7일 신규",
      value: k.weekNewContacts.toLocaleString(),
      sub: "신규 컨택트",
      icon: UsersIcon,
      tone: "from-teal-500 to-emerald-500",
    },
    {
      title: "활성 워크플로우",
      value: `${k.activeWorkflows} (run ${k.pendingRuns})`,
      sub: "활성 / 진행중",
      icon: Activity,
      tone: "from-violet-500 to-fuchsia-500",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">CRM 대시보드</h1>
          <p className="text-sm text-neutral-500 mt-1">한 명의 고객을 통합적으로 이해하는 운영 허브</p>
        </div>
        <Link
          href="/admin/crm/contacts"
          className="text-sm font-semibold px-4 py-2 rounded-xl ig-gradient text-white hover:opacity-90"
        >
          컨택트 전체 보기 →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="bg-white rounded-2xl border border-neutral-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-neutral-500">{c.title}</p>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.tone} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-black text-neutral-900">{c.value}</div>
              <p className="text-xs text-neutral-400 mt-1">{c.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 bg-white rounded-2xl border border-neutral-100 p-6">
        <h3 className="text-lg font-bold text-neutral-900 mb-2">다음 단계</h3>
        <p className="text-sm text-neutral-500 mb-4">CRM Phase 1 코어가 가동됐어. 다음 단계는 자동화 워크플로우·알림톡 채널·세그먼트 빌더야.</p>
        <ul className="space-y-2 text-sm text-neutral-700">
          <li>• 컨택트 상세에서 한 사람의 전체 타임라인 보기</li>
          <li>• 워크플로우(이벤트 트리거 자동 발송) — 다음 세션에서 빌드</li>
          <li>• 카카오 알림톡 (Solapi) — Solapi 가입·발신번호 인증 후 통합</li>
          <li>• 오픈채팅 예약 보드 — broadcast-notifier cron</li>
        </ul>
      </div>
    </div>
  );
}
