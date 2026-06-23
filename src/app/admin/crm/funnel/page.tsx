import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, BookOpen, Radio, Target, ShoppingBag, ArrowDown } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

function pct(num: number, den: number): number {
  if (!den) return 0;
  return Math.round((num / den) * 100);
}

export default async function FunnelDashboardPage() {
  const start30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const start7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // 전체 카운트 + 30일 + 7일
  const [
    totalContacts,
    freebieAll, freebie30, freebie7,
    ebook1All, ebook130, ebook17,
    ebook2All, ebook230, ebook27,
    consultationAll, consultation30, consultation7,
    liveAll, live30, live7,
    purchaseAll, purchase30, revenueAll, revenue30,
    freebiesList,
  ] = await Promise.all([
    prisma.contact.count(),
    prisma.freebieSubmission.count(),
    prisma.freebieSubmission.count({ where: { createdAt: { gte: start30 } } }),
    prisma.freebieSubmission.count({ where: { createdAt: { gte: start7 } } }),
    prisma.ebookSubmission.count({ where: { level: 1 } }),
    prisma.ebookSubmission.count({ where: { level: 1, createdAt: { gte: start30 } } }),
    prisma.ebookSubmission.count({ where: { level: 1, createdAt: { gte: start7 } } }),
    prisma.ebookSubmission.count({ where: { level: 2 } }),
    prisma.ebookSubmission.count({ where: { level: 2, createdAt: { gte: start30 } } }),
    prisma.ebookSubmission.count({ where: { level: 2, createdAt: { gte: start7 } } }),
    prisma.consultationRequest.count(),
    prisma.consultationRequest.count({ where: { createdAt: { gte: start30 } } }),
    prisma.consultationRequest.count({ where: { createdAt: { gte: start7 } } }),
    prisma.liveSignup.count(),
    prisma.liveSignup.count({ where: { createdAt: { gte: start30 } } }),
    prisma.liveSignup.count({ where: { createdAt: { gte: start7 } } }),
    prisma.purchase.count(),
    prisma.purchase.count({ where: { createdAt: { gte: start30 } } }),
    prisma.purchase.aggregate({ _sum: { amount: true } }),
    prisma.purchase.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: start30 } } }),
    prisma.freebie.findMany({
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { submissions: true } } },
      take: 10,
    }),
  ]);

  const allLeads = freebieAll + ebook1All + consultationAll;
  const conversionLiveFromLead = pct(liveAll, allLeads);
  const conversionPurchaseFromLive = pct(purchaseAll, liveAll);

  // 퍼널 단계
  const funnelStages = [
    { key: "lead", label: "자료·전자책·진단 신청", count: allLeads, color: "from-purple-500 to-pink-500", icon: BookOpen },
    { key: "live", label: "무료 라이브 신청", count: liveAll, color: "from-pink-500 to-orange-400", icon: Radio },
    { key: "purchase", label: "유료 구매", count: purchaseAll, color: "from-amber-500 to-red-500", icon: ShoppingBag },
  ];
  const maxFunnel = Math.max(...funnelStages.map((s) => s.count), 1);

  // 소스별 분포 (절대수)
  const sourceCards = [
    { key: "freebie", label: "무료 자료", all: freebieAll, m: freebie30, w: freebie7, icon: BookOpen, color: "from-purple-500 to-pink-500" },
    { key: "ebook1", label: "1차 전자책", all: ebook1All, m: ebook130, w: ebook17, icon: BookOpen, color: "from-blue-500 to-purple-500" },
    { key: "ebook2", label: "2차 전자책 인증", all: ebook2All, m: ebook230, w: ebook27, icon: BookOpen, color: "from-pink-500 to-rose-500" },
    { key: "consultation", label: "1:1 진단 신청", all: consultationAll, m: consultation30, w: consultation7, icon: Target, color: "from-amber-500 to-orange-500" },
    { key: "live", label: "무료 라이브", all: liveAll, m: live30, w: live7, icon: Radio, color: "from-emerald-500 to-cyan-500" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-neutral-900">자동화 신청 현황</h1>
        <p className="text-sm text-neutral-500 mt-1">
          모든 리드 채널과 무료 라이브 전환을 한 화면에 — "무료 강의를 듣게 만드는 것"이 우리 핵심 목표예요.
        </p>
      </div>

      {/* 핵심 KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="전체 컨택트" value={totalContacts} icon={Users} tone="from-neutral-700 to-neutral-900" />
        <KpiCard label="자료 신청 누적" value={allLeads} icon={BookOpen} tone="from-purple-500 to-pink-500" sub={`최근 7일 ${freebie7 + ebook17 + consultation7}건`} />
        <KpiCard label="무료 라이브 신청" value={liveAll} icon={Radio} tone="from-pink-500 to-orange-400" sub={`전환 ${conversionLiveFromLead}%`} highlight />
        <KpiCard label="이번 달 매출" value={revenue30._sum.amount ?? 0} icon={ShoppingBag} tone="from-amber-500 to-red-500" isMoney />
      </div>

      {/* 퍼널 인포그래픽 */}
      <section className="bg-white rounded-2xl border border-neutral-100 p-6 mb-8">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-neutral-900">전환 퍼널 (누적)</h2>
          <p className="text-xs text-neutral-500 mt-0.5">자료 신청 → 무료 라이브 → 유료 구매로 가는 흐름</p>
        </div>

        <div className="space-y-3">
          {funnelStages.map((s, i) => {
            const Icon = s.icon;
            const widthPct = Math.max(20, Math.round((s.count / maxFunnel) * 100));
            const nextStage = funnelStages[i + 1];
            const transferRate = nextStage ? pct(nextStage.count, s.count) : null;
            return (
              <div key={s.key}>
                <div className="flex items-center gap-3 mb-1">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-neutral-800">{s.label}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-neutral-900">{s.count.toLocaleString()}</div>
                  </div>
                </div>
                <div className="h-3 bg-neutral-100 rounded-full overflow-hidden ml-12">
                  <div
                    className={`h-full bg-gradient-to-r ${s.color} rounded-full transition-all`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
                {transferRate !== null && (
                  <div className="flex items-center gap-2 ml-12 my-2">
                    <ArrowDown className="w-3 h-3 text-neutral-400" />
                    <p className="text-xs font-semibold text-neutral-500">
                      <span className={transferRate >= 30 ? "text-emerald-600" : transferRate >= 10 ? "text-amber-600" : "text-neutral-400"}>
                        {transferRate}%
                      </span>{" "}
                      가 다음 단계로 전환
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-pink-50 border border-pink-200 rounded-xl px-4 py-3">
            <p className="text-xs font-bold text-pink-700">자료 → 라이브 전환율</p>
            <p className="text-2xl font-black text-pink-600 mt-0.5">{conversionLiveFromLead}%</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-xs font-bold text-amber-700">라이브 → 구매 전환율</p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">{conversionPurchaseFromLive}%</p>
          </div>
        </div>
      </section>

      {/* 채널별 상세 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-neutral-900 mb-3">채널별 신청 현황</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sourceCards.map((s) => {
            const Icon = s.icon;
            const max = Math.max(...sourceCards.map((c) => c.all), 1);
            const barW = Math.max(8, Math.round((s.all / max) * 100));
            return (
              <div key={s.key} className="bg-white rounded-2xl border border-neutral-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-neutral-500">{s.label}</p>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-black text-neutral-900 mb-2">{s.all.toLocaleString()}</div>
                <div className="h-1.5 bg-neutral-100 rounded-full mb-3 overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${s.color} rounded-full`} style={{ width: `${barW}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-neutral-500">
                  <span>최근 30일 <strong className="text-neutral-700">{s.m.toLocaleString()}</strong></span>
                  <span>최근 7일 <strong className="text-neutral-700">{s.w.toLocaleString()}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 자료별 리스트 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-neutral-900">무료 자료별 신청</h2>
          <Link href="/admin/crm/freebies" className="text-xs font-semibold text-pink-600 hover:text-pink-700">
            자료 관리 →
          </Link>
        </div>
        {freebiesList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-100 p-10 text-center text-sm text-neutral-400">
            아직 자료가 없어요. <Link href="/admin/crm/freebies/new" className="text-pink-600 underline">새 자료 만들기</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
            {freebiesList.map((f) => {
              const max = Math.max(...freebiesList.map((x) => x._count.submissions), 1);
              const barW = Math.max(4, Math.round((f._count.submissions / max) * 100));
              return (
                <Link
                  key={f.id}
                  href={`/admin/crm/freebies/${f.id}/edit`}
                  className="flex items-center gap-3 px-5 py-3 border-b border-neutral-50 last:border-0 hover:bg-neutral-50"
                >
                  <BookOpen className="w-4 h-4 text-neutral-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{f.title}</p>
                    <p className="text-xs text-neutral-500 font-mono truncate">/freebie/{f.slug}</p>
                  </div>
                  <div className="hidden sm:block w-32">
                    <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full ig-gradient rounded-full" style={{ width: `${barW}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0 w-20">
                    <p className="text-sm font-bold text-neutral-900">{f._count.submissions}</p>
                    <p className="text-[10px] text-neutral-400">신청</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  tone,
  sub,
  isMoney,
  highlight,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  sub?: string;
  isMoney?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={"rounded-2xl p-5 border " + (highlight ? "bg-pink-50 border-pink-200" : "bg-white border-neutral-100")}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-neutral-500">{label}</p>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tone} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className={"text-2xl font-black " + (highlight ? "ig-gradient-text" : "text-neutral-900")}>
        {isMoney ? formatPrice(value) : value.toLocaleString()}
      </div>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  );
}
