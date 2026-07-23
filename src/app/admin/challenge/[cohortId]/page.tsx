import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatKstHuman } from "@/lib/kst";
import { ChevronLeft, ChevronRight, Users, MessageSquareText, Video } from "lucide-react";
import { AccessPasswordEditor } from "./_components/AccessPasswordEditor";

export const dynamic = "force-dynamic";

export default async function CohortDetailPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;
  const cohort = await prisma.challengeCohort.findUnique({
    where: { id: cohortId },
    include: {
      weeks: {
        orderBy: { weekIndex: "asc" },
      },
      enrollments: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!cohort) notFound();

  // 구매자(자동 참여) — 유저 정보까지
  const purchaseRows = await prisma.purchase.findMany({
    where: { refundedAt: null, product: { slug: cohort.productSlug } },
    select: { user: { select: { id: true, name: true, email: true } } },
  });
  const purchasers = purchaseRows.length;
  // 구매자 + 비밀번호로 입장한 참여자 (합산이 실제 참여 인원, userId로 중복 제거)
  const rosterMap = new Map<
    string,
    { id: string; name: string | null; email: string; via: "purchase" | "password" }
  >();
  for (const p of purchaseRows) {
    if (p.user) rosterMap.set(p.user.id, { ...p.user, via: "purchase" });
  }
  for (const e of cohort.enrollments) {
    if (!rosterMap.has(e.user.id)) {
      rosterMap.set(e.user.id, { ...e.user, via: "password" });
    }
  }
  const roster = Array.from(rosterMap.values());
  const enrolled = roster.length;

  // 참여자별 주차별 제출 현황 (임시저장 draft는 제외 = 미제출로 취급)
  const allSubmissions = await prisma.homeworkSubmission.findMany({
    where: { week: { cohortId } },
    select: { userId: true, status: true, feedbackAt: true, week: { select: { weekIndex: true } } },
  });
  // userId -> weekIndex -> "submitted" | "feedback" | "draft"
  const statusMap = new Map<string, Map<number, "submitted" | "feedback" | "draft">>();
  // weekIndex -> 정식 제출 수(draft 제외)
  const submittedByWeek = new Map<number, number>();
  let totalSubmissions = 0;
  for (const s of allSubmissions) {
    if (!statusMap.has(s.userId)) statusMap.set(s.userId, new Map());
    const state = s.feedbackAt ? "feedback" : s.status === "draft" ? "draft" : "submitted";
    statusMap.get(s.userId)!.set(s.week.weekIndex, state);
    if (state !== "draft") {
      submittedByWeek.set(s.week.weekIndex, (submittedByWeek.get(s.week.weekIndex) ?? 0) + 1);
      totalSubmissions++;
    }
  }
  const pendingFeedback = await prisma.homeworkSubmission.count({
    where: { week: { cohortId }, status: "submitted" },
  });

  const now = new Date();
  const openedWeeks = cohort.weeks.filter((w) => w.openAt.getTime() <= now.getTime());
  // 제출·피드백 리뷰 진입용: 가장 최근 오픈된 주차
  const reviewWeek = openedWeeks[openedWeeks.length - 1] ?? null;

  return (
    <div>
      <Link
        href="/admin/challenge"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> 목록으로
      </Link>

      <div className="flex items-center justify-between mb-2 gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">{cohort.name}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {cohort.productSlug} · Week 1 오픈 {formatKstHuman(cohort.week1StartAt)}
          </p>
        </div>
        {reviewWeek && (
          <Link
            href={`/admin/challenge/${cohort.id}/weeks/${reviewWeek.id}/submissions`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800"
          >
            <MessageSquareText className="w-4 h-4" /> 제출 · 피드백
          </Link>
        )}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-3 mt-6 mb-8">
        <div className="rounded-2xl border border-neutral-100 bg-white p-4">
          <p className="text-xs font-semibold text-neutral-500 inline-flex items-center gap-1">
            <Users className="w-3 h-3" /> 참여자
          </p>
          <p className="mt-1 text-2xl font-black text-neutral-900">{enrolled}</p>
        </div>
        <div className="rounded-2xl border border-neutral-100 bg-white p-4">
          <p className="text-xs font-semibold text-neutral-500">누적 제출</p>
          <p className="mt-1 text-2xl font-black text-neutral-900">{totalSubmissions}</p>
        </div>
        <div className="rounded-2xl border border-neutral-100 bg-white p-4">
          <p className="text-xs font-semibold text-neutral-500">피드백 대기</p>
          <p
            className={
              "mt-1 text-2xl font-black " +
              (pendingFeedback > 0 ? "text-pink-600" : "text-neutral-900")
            }
          >
            {pendingFeedback}
          </p>
        </div>
      </div>

      {/* 참여자별 숙제 현황 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <h2 className="text-lg font-bold text-neutral-900">참여자별 숙제 현황</h2>
          <div className="flex items-center gap-3 text-[11px] text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <span className="w-4 h-4 rounded-md bg-neutral-900 text-white inline-flex items-center justify-center text-[9px] font-bold">✓</span>
              제출
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-4 h-4 rounded-md bg-emerald-500 text-white inline-flex items-center justify-center text-[9px] font-bold">★</span>
              피드백완료
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-4 h-4 rounded-md bg-amber-400 text-white inline-flex items-center justify-center text-[9px] font-bold">…</span>
              작성 중
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-4 h-4 rounded-md border border-neutral-200 bg-white inline-flex items-center justify-center text-neutral-300 text-[9px]">·</span>
              미제출
            </span>
          </div>
        </div>

        {roster.length === 0 ? (
          <p className="text-sm text-neutral-400 bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
            아직 참여자가 없어요. 위에서 입장 비밀번호를 공지하거나 구매가 연결되면 여기에 표시됩니다.
          </p>
        ) : openedWeeks.length === 0 ? (
          <p className="text-sm text-neutral-400 bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
            아직 오픈된 주차가 없어요.
          </p>
        ) : (
          <div className="rounded-2xl border border-neutral-100 bg-white overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-left font-semibold text-neutral-500 text-xs px-4 py-3 sticky left-0 bg-white">
                    참여자
                  </th>
                  {openedWeeks.map((w) => (
                    <th key={w.id} className="font-semibold text-neutral-500 text-xs px-2 py-3 text-center whitespace-nowrap">
                      <Link
                        href={`/admin/challenge/${cohort.id}/weeks/${w.id}/submissions`}
                        className="hover:text-pink-600 hover:underline"
                        title={`Week ${w.weekIndex} 제출·피드백`}
                      >
                        W{w.weekIndex}
                      </Link>
                    </th>
                  ))}
                  <th className="font-semibold text-neutral-500 text-xs px-3 py-3 text-center whitespace-nowrap">
                    완료율
                  </th>
                </tr>
              </thead>
              <tbody>
                {roster.map((u) => {
                  const userStatus = statusMap.get(u.id);
                  const doneCount = openedWeeks.filter((w) => {
                    const st = userStatus?.get(w.weekIndex);
                    return st === "submitted" || st === "feedback";
                  }).length;
                  return (
                    <tr key={u.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50">
                      <td className="px-4 py-2.5 sticky left-0 bg-white">
                        <div className="min-w-0">
                          <p className="font-semibold text-neutral-900 truncate flex items-center gap-1.5">
                            {u.name || "이름 없음"}
                            {u.via === "password" && (
                              <span className="text-[9px] font-bold text-pink-600 bg-pink-50 rounded px-1 py-0.5 shrink-0">
                                비번
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-neutral-400 truncate">{u.email}</p>
                        </div>
                      </td>
                      {openedWeeks.map((w) => {
                        const st = userStatus?.get(w.weekIndex);
                        const href = `/admin/challenge/${cohort.id}/weeks/${w.id}/submissions#u-${u.id}`;
                        const badge =
                          st === "feedback" ? (
                            <span className="inline-flex w-6 h-6 rounded-md bg-emerald-500 text-white items-center justify-center text-xs font-bold" title="피드백 완료 — 클릭해서 보기">
                              ★
                            </span>
                          ) : st === "submitted" ? (
                            <span className="inline-flex w-6 h-6 rounded-md bg-neutral-900 text-white items-center justify-center text-xs font-bold" title="제출됨 — 클릭해서 숙제·피드백 보기">
                              ✓
                            </span>
                          ) : st === "draft" ? (
                            <span className="inline-flex w-6 h-6 rounded-md bg-amber-400 text-white items-center justify-center text-xs font-bold" title="작성 중(임시저장) — 클릭해서 보기">
                              …
                            </span>
                          ) : (
                            <span className="inline-flex w-6 h-6 rounded-md border border-neutral-200 bg-white text-neutral-300 items-center justify-center text-xs" title="미제출">
                              ·
                            </span>
                          );
                        return (
                          <td key={w.id} className="px-2 py-2.5 text-center">
                            {st ? (
                              <Link
                                href={href}
                                className="inline-flex rounded-md hover:ring-2 hover:ring-pink-300 hover:ring-offset-1 transition-shadow"
                                title="클릭해서 이 학생의 숙제·피드백 보기"
                              >
                                {badge}
                              </Link>
                            ) : (
                              badge
                            )}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={
                            "text-xs font-bold " +
                            (doneCount === openedWeeks.length
                              ? "text-emerald-600"
                              : doneCount === 0
                                ? "text-neutral-300"
                                : "text-neutral-700")
                          }
                        >
                          {doneCount}/{openedWeeks.length}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 주차 리스트 */}
      <h2 className="text-lg font-bold text-neutral-900 mb-3">주차별 세팅</h2>
      <ul className="space-y-2">
        {cohort.weeks.map((w) => {
          const opened = w.openAt.getTime() <= now.getTime();
          const dueSoon = !opened || w.homeworkDueAt.getTime() >= now.getTime();
          const currentWeek =
            opened && w.homeworkDueAt.getTime() >= now.getTime() ? true : false;
          return (
            <li key={w.id}>
              <Link
                href={`/admin/challenge/${cohort.id}/weeks/${w.id}/edit`}
                className={
                  "flex items-center gap-4 rounded-2xl border p-4 hover:border-pink-300 hover:bg-pink-50/30 transition-colors " +
                  (currentWeek
                    ? "border-pink-300 bg-pink-50/50"
                    : "border-neutral-100 bg-white")
                }
              >
                <div
                  className={
                    "shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-black " +
                    (opened
                      ? "ig-gradient text-white"
                      : "bg-neutral-100 text-neutral-400")
                  }
                >
                  W{w.weekIndex}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-neutral-900 truncate">{w.title || `Week ${w.weekIndex}`}</p>
                    {currentWeek && (
                      <span className="text-[10px] font-bold text-pink-600 bg-pink-100 rounded-full px-2 py-0.5">
                        진행 중
                      </span>
                    )}
                    {w.liveAt && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-100 rounded-full px-2 py-0.5 inline-flex items-center gap-1">
                        <Video className="w-2.5 h-2.5" /> 라이브
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    오픈 {formatKstHuman(w.openAt)}
                    <span className="mx-1.5 text-neutral-300">·</span>
                    마감 {formatKstHuman(w.homeworkDueAt)}
                    {w.liveAt && (
                      <>
                        <span className="mx-1.5 text-neutral-300">·</span>
                        라이브 {formatKstHuman(w.liveAt)}
                      </>
                    )}
                  </p>
                  <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-3">
                    <span>제출 {submittedByWeek.get(w.weekIndex) ?? 0}건</span>
                    {!w.homeworkPrompt && (
                      <span className="text-orange-500 font-semibold">숙제 프롬프트 미작성</span>
                    )}
                    {w.liveAt && !w.zoomUrl && (
                      <span className="text-orange-500 font-semibold">Zoom URL 미입력</span>
                    )}
                    {!dueSoon && !w.recordingUrl && (
                      <span className="text-orange-500 font-semibold">녹화본 미업로드</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-300" />
              </Link>
            </li>
          );
        })}
      </ul>

      {/* 입장 비밀번호 + 참여자 명단 */}
      <div className="mt-8">
        <AccessPasswordEditor
          cohortId={cohort.id}
          cohortUrl={`/challenge/${cohort.id}`}
          initialPassword={cohort.accessPassword ?? ""}
        />
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-bold text-neutral-900 mb-3 inline-flex items-center gap-2">
          <Users className="w-4 h-4" /> 비밀번호로 입장한 참여자
          <span className="text-sm font-semibold text-neutral-400">
            {cohort.enrollments.length}명
          </span>
        </h2>
        {cohort.enrollments.length === 0 ? (
          <p className="text-sm text-neutral-400 bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
            아직 비밀번호로 입장한 참여자가 없어요. 위 비밀번호를 카톡방에 공지하면, 로그인한 분들이
            입력 후 자동으로 여기에 등록됩니다.
          </p>
        ) : (
          <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
            {cohort.enrollments.map((e, i) => (
              <div
                key={e.id}
                className={
                  "flex items-center gap-3 px-5 py-3 " +
                  (i === cohort.enrollments.length - 1 ? "" : "border-b border-neutral-100")
                }
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 truncate">
                    {e.user.name || "이름 없음"}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">{e.user.email}</p>
                </div>
                <p className="text-xs text-neutral-400 shrink-0">
                  {formatKstHuman(e.createdAt)} 입장
                </p>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-neutral-400 mt-3">
          ※ 챌린지 상품을 직접 구매한 분({purchasers}명)은 이 목록과 별개로 자동 참여됩니다.
        </p>
      </div>
    </div>
  );
}
