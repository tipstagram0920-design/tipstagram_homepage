import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  Users as UsersIcon,
  ShoppingBag,
  Mail,
  Activity,
  TrendingUp,
  RotateCcw,
} from "lucide-react";

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

async function getRecentPurchases() {
  return await prisma.purchase.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { title: true } },
    },
  }).catch(() => []);
}

async function getRecentContacts() {
  return await prisma.contact.findMany({
    take: 6,
    orderBy: { firstSeenAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      source: true,
      firstSeenAt: true,
    },
  }).catch(() => []);
}

export default async function AdminDashboard() {
  const [k, purchases, contacts] = await Promise.all([
    getKpis(),
    getRecentPurchases(),
    getRecentContacts(),
  ]);

  const kpiCards = [
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
          <h1 className="text-2xl font-black text-neutral-900">대시보드</h1>
          <p className="text-sm text-neutral-500 mt-1">고객 흐름·매출·자동화 한눈에 보기</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/crm/contacts"
            className="text-sm font-semibold px-4 py-2 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          >
            컨택트 보기
          </Link>
          <Link
            href="/admin/crm/workflows"
            className="text-sm font-semibold px-4 py-2 rounded-xl ig-gradient text-white hover:opacity-90"
          >
            워크플로우 관리 →
          </Link>
        </div>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((c) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 결제 */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-neutral-900">최근 결제</h2>
            <Link href="/admin/users" className="text-xs text-pink-600 hover:text-pink-700 font-semibold">
              전체 →
            </Link>
          </div>
          {purchases.length === 0 ? (
            <p className="text-sm text-neutral-400 py-6 text-center">결제 내역이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {purchases.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{p.user.name || p.user.email}</p>
                    <p className="text-xs text-neutral-500 truncate">{p.product.title}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-bold text-neutral-900">{formatPrice(p.amount)}</p>
                    <p className="text-xs text-neutral-400">{formatDate(p.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 최근 컨택트 */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-neutral-900">최근 신규 컨택트</h2>
            <Link href="/admin/crm/contacts" className="text-xs text-pink-600 hover:text-pink-700 font-semibold">
              전체 →
            </Link>
          </div>
          {contacts.length === 0 ? (
            <p className="text-sm text-neutral-400 py-6 text-center">아직 컨택트가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {contacts.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/crm/contacts/${c.id}`}
                  className="flex items-center gap-3 hover:bg-neutral-50 -mx-2 px-2 py-1.5 rounded-lg"
                >
                  <div className="w-9 h-9 rounded-full ig-gradient flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {(c.name?.[0] || c.email[0]).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{c.name || "이름 없음"}</p>
                    <p className="text-xs text-neutral-500 truncate">{c.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {c.source && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                        {c.source}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
