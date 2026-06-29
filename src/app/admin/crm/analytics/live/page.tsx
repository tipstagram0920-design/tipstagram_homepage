import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Eye, MousePointerClick, Send, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

type RangeKey = "1d" | "7d" | "30d" | "all";
const RANGE_OPTIONS: { key: RangeKey; label: string; days: number | null }[] = [
  { key: "1d", label: "24시간", days: 1 },
  { key: "7d", label: "7일", days: 7 },
  { key: "30d", label: "30일", days: 30 },
  { key: "all", label: "전체", days: null },
];

function pct(n: number, d: number) {
  if (!d) return 0;
  return Math.round((n / d) * 1000) / 10;
}

function topGroupBy<T extends Record<string, unknown>>(
  rows: T[],
  key: keyof T,
  fallback = "(직접 접속)"
): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const v = (r[key] as string | null) || fallback;
    map.set(v, (map.get(v) || 0) + 1);
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function classifyReferrer(ref: string | null): string {
  if (!ref) return "(직접 접속)";
  try {
    const u = new URL(ref);
    const h = u.hostname.toLowerCase().replace(/^www\./, "");
    if (h.includes("instagram")) return "Instagram";
    if (h.includes("youtube") || h.includes("youtu.be")) return "YouTube";
    if (h.includes("naver")) return "Naver";
    if (h.includes("google")) return "Google";
    if (h.includes("kakao") || h.includes("daum")) return "카카오/다음";
    if (h.includes("facebook") || h.includes("fb.me")) return "Facebook";
    if (h.includes("t.co") || h.includes("twitter") || h.includes("x.com")) return "X/Twitter";
    return h;
  } catch {
    return "(잘못된 referrer)";
  }
}

export default async function LiveAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: RangeKey }>;
}) {
  const sp = await searchParams;
  const range = sp.range || "7d";
  const rangeDef = RANGE_OPTIONS.find((r) => r.key === range) || RANGE_OPTIONS[1];
  const since =
    rangeDef.days === null ? null : new Date(Date.now() - rangeDef.days * 24 * 60 * 60 * 1000);

  const where = {
    path: "/live",
    ...(since ? { createdAt: { gte: since } } : {}),
  };

  const events = await prisma.trackEvent.findMany({
    where,
    select: {
      sessionId: true,
      type: true,
      referrer: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      country: true,
      props: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  // 세션별 funnel 집계
  type SessionState = {
    view: boolean;
    start: boolean;
    submit: boolean;
    success: boolean;
    blockedNoConsent: boolean;
    failed: boolean;
  };
  const sessions = new Map<string, SessionState>();
  for (const e of events) {
    const s =
      sessions.get(e.sessionId) ||
      ({ view: false, start: false, submit: false, success: false, blockedNoConsent: false, failed: false } as SessionState);
    if (e.type === "page_view") s.view = true;
    else if (e.type === "form_start") s.start = true;
    else if (e.type === "form_submit") s.submit = true;
    else if (e.type === "form_success") s.success = true;
    else if (e.type === "form_block") {
      const p = (e.props ?? {}) as { reason?: string };
      if (p.reason === "no_consent") s.blockedNoConsent = true;
    } else if (e.type === "form_fail") s.failed = true;
    sessions.set(e.sessionId, s);
  }

  const viewCount = [...sessions.values()].filter((s) => s.view).length;
  const startCount = [...sessions.values()].filter((s) => s.start).length;
  const submitCount = [...sessions.values()].filter((s) => s.submit).length;
  const successCount = [...sessions.values()].filter((s) => s.success).length;
  const blockedNoConsent = [...sessions.values()].filter((s) => s.blockedNoConsent && !s.success).length;
  const failedSubmit = [...sessions.values()].filter((s) => s.failed && !s.success).length;
  const abandonedAfterStart = [...sessions.values()].filter((s) => s.start && !s.submit).length;
  const abandonedAfterView = [...sessions.values()].filter((s) => s.view && !s.start).length;

  // 유입 소스 — page_view 만 대상
  const views = events.filter((e) => e.type === "page_view");
  const byReferrer = topGroupBy(
    views.map((v) => ({ k: classifyReferrer(v.referrer) })),
    "k"
  );
  const byUtmSource = topGroupBy(views, "utmSource");
  const byUtmCampaign = topGroupBy(views, "utmCampaign");
  const byCountry = topGroupBy(views, "country", "(미상)");

  // 신청 완료자(form_success)의 유입 소스
  const successSessionIds = new Set(
    [...sessions.entries()].filter(([, s]) => s.success).map(([sid]) => sid)
  );
  const viewsOfSuccess = views.filter((v) => successSessionIds.has(v.sessionId));
  const successByReferrer = topGroupBy(
    viewsOfSuccess.map((v) => ({ k: classifyReferrer(v.referrer) })),
    "k"
  );

  // 일별 추이
  const daily = new Map<string, { v: number; s: number }>();
  for (const e of views) {
    const day = e.createdAt.toISOString().slice(0, 10);
    const d = daily.get(day) || { v: 0, s: 0 };
    d.v += 1;
    daily.set(day, d);
  }
  for (const sid of successSessionIds) {
    const day = events
      .filter((e) => e.sessionId === sid && e.type === "form_success")[0]
      ?.createdAt.toISOString().slice(0, 10);
    if (day) {
      const d = daily.get(day) || { v: 0, s: 0 };
      d.s += 1;
      daily.set(day, d);
    }
  }
  const dailyArr = [...daily.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">무료 라이브 페이지 분석</h1>
          <p className="text-sm text-neutral-500 mt-1">
            유입 소스 · 클릭 vs 신청 전환율 · 이탈 단계 — <code className="text-xs">/live</code> 기준
          </p>
        </div>
        <div className="flex gap-1.5">
          {RANGE_OPTIONS.map((r) => (
            <Link
              key={r.key}
              href={`/admin/crm/analytics/live?range=${r.key}`}
              className={
                "px-3 py-1.5 rounded-xl text-xs font-semibold " +
                (range === r.key
                  ? "ig-gradient text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200")
              }
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      {viewCount === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center">
          <Eye className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-600 mb-1">선택한 기간에 페이지뷰가 없어요.</p>
          <p className="text-xs text-neutral-400">
            이 페이지에 처음 접속자가 들어오면 이벤트가 쌓이기 시작합니다.
          </p>
        </div>
      ) : (
        <>
          {/* 핵심 퍼널 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <FunnelCard label="페이지 조회" value={viewCount} icon={Eye} sub="고유 세션" />
            <FunnelCard
              label="폼 클릭(시작)"
              value={startCount}
              icon={MousePointerClick}
              sub={`${pct(startCount, viewCount)}% 진입`}
            />
            <FunnelCard
              label="신청 제출"
              value={submitCount}
              icon={Send}
              sub={`${pct(submitCount, startCount)}% 시작→제출`}
            />
            <FunnelCard
              label="신청 완료"
              value={successCount}
              icon={CheckCircle2}
              sub={`${pct(successCount, viewCount)}% 전환율`}
              highlight
            />
          </div>

          {/* 이탈 분석 */}
          <section className="bg-white rounded-2xl border border-neutral-100 p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-bold text-neutral-900">왜 신청하지 않았나</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <DropoffCard
                label="페이지만 보고 떠남"
                value={abandonedAfterView}
                ratio={pct(abandonedAfterView, viewCount)}
                color="from-neutral-400 to-neutral-500"
                detail="폼 필드를 한 번도 클릭 안 함"
              />
              <DropoffCard
                label="입력하다 중단"
                value={abandonedAfterStart}
                ratio={pct(abandonedAfterStart, viewCount)}
                color="from-orange-400 to-amber-500"
                detail="폼 시작 후 제출 안 함"
              />
              <DropoffCard
                label="동의 체크 안 함"
                value={blockedNoConsent}
                ratio={pct(blockedNoConsent, viewCount)}
                color="from-amber-500 to-red-500"
                detail="제출 클릭했지만 동의 미체크"
              />
              <DropoffCard
                label="제출 오류·네트워크"
                value={failedSubmit}
                ratio={pct(failedSubmit, viewCount)}
                color="from-red-500 to-pink-500"
                detail="API 에러 또는 네트워크 실패"
              />
            </div>
          </section>

          {/* 유입 소스 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
            <SourceCard title="유입 소스 (Referrer)" rows={byReferrer} icon={ExternalLink} />
            <SourceCard title="UTM Source" rows={byUtmSource} icon={ExternalLink} emptyHint="UTM 파라미터로 캠페인을 구분해보세요. 예) /live?utm_source=instagram&utm_campaign=summer" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
            <SourceCard title="UTM Campaign" rows={byUtmCampaign} icon={ExternalLink} emptyHint="utm_campaign 미사용" />
            <SourceCard title="국가" rows={byCountry} icon={ExternalLink} />
          </div>

          {/* 신청 완료자 유입 소스 */}
          {successCount > 0 && (
            <section className="bg-white rounded-2xl border border-neutral-100 p-5 mb-6">
              <h2 className="text-base font-bold text-neutral-900 mb-3">
                <span className="ig-gradient-text">신청 완료자</span>가 어디서 왔는지
              </h2>
              <div className="space-y-2">
                {successByReferrer.map((r) => (
                  <div key={r.label} className="flex items-center gap-3">
                    <p className="text-sm text-neutral-700 w-32 truncate">{r.label}</p>
                    <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full ig-gradient rounded-full"
                        style={{ width: `${Math.max(4, (r.count / successByReferrer[0].count) * 100)}%` }}
                      />
                    </div>
                    <p className="text-sm font-bold text-neutral-900 w-8 text-right">{r.count}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 일별 추이 */}
          {dailyArr.length > 1 && (
            <section className="bg-white rounded-2xl border border-neutral-100 p-5">
              <h2 className="text-base font-bold text-neutral-900 mb-3">일별 추이</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs font-semibold text-neutral-500 border-b border-neutral-100">
                      <th className="text-left py-2">날짜</th>
                      <th className="text-right py-2">조회</th>
                      <th className="text-right py-2">신청</th>
                      <th className="text-right py-2">전환율</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyArr.map(([day, d]) => (
                      <tr key={day} className="border-b border-neutral-50 last:border-0">
                        <td className="py-2 text-neutral-700">{day}</td>
                        <td className="py-2 text-right text-neutral-700">{d.v}</td>
                        <td className="py-2 text-right text-neutral-900 font-semibold">{d.s}</td>
                        <td className="py-2 text-right text-pink-600 font-bold">{pct(d.s, d.v)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function FunnelCard({
  label,
  value,
  icon: Icon,
  sub,
  highlight,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className={"rounded-2xl border p-4 " + (highlight ? "bg-pink-50 border-pink-200" : "bg-white border-neutral-100")}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-neutral-500">{label}</p>
        <Icon className={"w-4 h-4 " + (highlight ? "text-pink-500" : "text-neutral-400")} />
      </div>
      <div className={"text-2xl font-black " + (highlight ? "ig-gradient-text" : "text-neutral-900")}>
        {value.toLocaleString()}
      </div>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  );
}

function DropoffCard({
  label,
  value,
  ratio,
  color,
  detail,
}: {
  label: string;
  value: number;
  ratio: number;
  color: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-100 p-4">
      <p className="text-xs font-semibold text-neutral-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-xl font-black text-neutral-900">{value.toLocaleString()}</span>
        <span className="text-xs font-semibold text-neutral-500">({ratio}%)</span>
      </div>
      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden mb-2">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full`} style={{ width: `${Math.min(100, ratio)}%` }} />
      </div>
      <p className="text-[11px] text-neutral-400 leading-snug">{detail}</p>
    </div>
  );
}

function SourceCard({
  title,
  rows,
  icon: Icon,
  emptyHint,
}: {
  title: string;
  rows: { label: string; count: number }[];
  icon: React.ComponentType<{ className?: string }>;
  emptyHint?: string;
}) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-neutral-400" />
        <h3 className="text-sm font-bold text-neutral-900">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-neutral-400 py-3">{emptyHint || "데이터 없음"}</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-3">
              <p className="text-sm text-neutral-700 w-32 truncate" title={r.label}>{r.label}</p>
              <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full ig-gradient rounded-full"
                  style={{ width: `${Math.max(4, (r.count / max) * 100)}%` }}
                />
              </div>
              <p className="text-sm font-bold text-neutral-900 w-8 text-right">{r.count}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
