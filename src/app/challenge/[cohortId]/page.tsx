import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { assertCohortEnrollment } from "@/lib/challenge-enrollment";
import { formatKstHuman } from "@/lib/kst";
import { CheckCircle2, Circle, Lock, Trophy, ArrowRight, MessageSquareText, Calendar } from "lucide-react";
import { PasswordGate } from "./_components/PasswordGate";

export const dynamic = "force-dynamic";

export default async function ChallengeDashboardPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const session = await auth();
  const { cohortId } = await params;
  if (!session?.user?.id) redirect(`/login?redirect=/challenge/${cohortId}`);

  const isAdmin = (session.user as { role?: string }).role === "ADMIN";
  const enrolled = await assertCohortEnrollment(session.user.id, cohortId);
  if (!enrolled && !isAdmin) {
    // 아직 등록 안 됨 → 공용 비밀번호로 입장 가능한 기수면 비번 입력 화면 노출
    const gateCohort = await prisma.challengeCohort.findUnique({
      where: { id: cohortId },
      select: { id: true, name: true, week1StartAt: true, accessPassword: true },
    });
    if (!gateCohort) notFound();
    if (!gateCohort.accessPassword) notFound(); // 비번 미설정 = 비번 입장 불가
    return (
      <>
        <Navbar />
        <main className="relative min-h-screen bg-gradient-to-b from-neutral-100 via-neutral-50 to-white text-neutral-900">
          <div className="max-w-md mx-auto px-4 sm:px-6 pt-32 pb-24">
            <PasswordGate cohortId={gateCohort.id} cohortName={gateCohort.name} />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const cohort = await prisma.challengeCohort.findUnique({
    where: { id: cohortId },
    include: {
      weeks: {
        orderBy: { weekIndex: "asc" },
        include: {
          submissions: {
            where: { userId: session.user.id },
            select: { id: true, status: true, submittedAt: true, feedbackAt: true },
          },
        },
      },
    },
  });
  if (!cohort) notFound();

  const now = new Date();

  const currentWeek =
    cohort.weeks.find(
      (w, i) =>
        w.openAt.getTime() <= now.getTime() &&
        (i === cohort.weeks.length - 1 || cohort.weeks[i + 1].openAt.getTime() > now.getTime())
    ) ?? cohort.weeks[0];

  // 내 숙제 현황 요약 (draft는 미제출로 취급)
  const openedCount = cohort.weeks.filter((w) => w.openAt.getTime() <= now.getTime()).length;
  const submittedCount = cohort.weeks.filter(
    (w) => w.submissions[0] && w.submissions[0].status !== "draft"
  ).length;
  const feedbackCount = cohort.weeks.filter((w) => w.submissions[0]?.feedbackAt).length;

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-gradient-to-b from-neutral-100 via-neutral-50 to-white text-neutral-900 overflow-hidden">
        {/* 은은한 백드롭 오브 (Apple 스타일 vibrancy) */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,180,220,0.55), transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-40 -right-40 w-[520px] h-[520px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(180,200,255,0.55), transparent 70%)" }}
        />

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-24">
          {/* Hero 카드 · Apple 시스템 설정 스타일 */}
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] p-8 sm:p-10 text-center mb-6">
            <div className="mx-auto mb-5 w-20 h-20 rounded-3xl ig-gradient shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_30px_-8px_rgba(131,58,180,0.5)] flex items-center justify-center">
              <Trophy className="w-9 h-9 text-white drop-shadow" strokeWidth={2.25} />
            </div>
            <p className="text-[11px] font-bold tracking-[2px] uppercase text-neutral-500 mb-1">
              5주 챌린지
            </p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 mb-2">
              {cohort.name}
            </h1>
            <p className="text-[13px] text-neutral-500 leading-relaxed">
              Week 1 오픈 · {formatKstHuman(cohort.week1StartAt)}
            </p>
          </div>

          {/* 내 숙제 현황 요약 */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="rounded-2xl bg-white border border-neutral-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.03)] px-4 py-4 text-center">
              <p className="text-[11px] font-bold text-neutral-500">열린 주차</p>
              <p className="mt-1 text-2xl font-black text-neutral-900">{openedCount}</p>
            </div>
            <div className="rounded-2xl bg-white border border-neutral-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.03)] px-4 py-4 text-center">
              <p className="text-[11px] font-bold text-neutral-500">제출 완료</p>
              <p className="mt-1 text-2xl font-black text-emerald-600">{submittedCount}</p>
            </div>
            <div className="rounded-2xl bg-white border border-neutral-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.03)] px-4 py-4 text-center">
              <p className="text-[11px] font-bold text-neutral-500">피드백 받음</p>
              <p className="mt-1 text-2xl font-black text-neutral-900">{feedbackCount}</p>
            </div>
          </div>

          {/* 5주 진행바 카드 */}
          <div className="rounded-3xl bg-white border border-neutral-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.03)] px-6 py-6 mb-6">
            <ol className="flex items-center gap-2">
              {cohort.weeks.map((w) => {
                const opened = w.openAt.getTime() <= now.getTime();
                const submitted = !!w.submissions[0] && w.submissions[0].status !== "draft";
                const feedback = w.submissions[0]?.feedbackAt;
                const isCurrent = w.id === currentWeek?.id;
                return (
                  <li key={w.id} className="flex-1">
                    <div
                      className={
                        "h-1 rounded-full transition-all " +
                        (opened ? "bg-neutral-900" : "bg-neutral-200")
                      }
                    />
                    <div
                      className={
                        "mt-2.5 flex flex-col items-center gap-1 " +
                        (isCurrent ? "text-neutral-900" : "text-neutral-400")
                      }
                    >
                      <div
                        className={
                          "w-9 h-9 rounded-full flex items-center justify-center transition-all " +
                          (feedback
                            ? "bg-neutral-900 text-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.4)]"
                            : submitted
                              ? "border-2 border-neutral-900 bg-white text-neutral-900"
                              : opened
                                ? "border-2 border-neutral-300 bg-white text-neutral-500"
                                : "bg-neutral-100 text-neutral-400")
                        }
                      >
                        {feedback ? (
                          <CheckCircle2 className="w-4.5 h-4.5" strokeWidth={2.5} />
                        ) : submitted ? (
                          <Circle className="w-3.5 h-3.5 fill-neutral-900" strokeWidth={0} />
                        ) : opened ? (
                          <Circle className="w-3.5 h-3.5" strokeWidth={2.5} />
                        ) : (
                          <Lock className="w-3.5 h-3.5" strokeWidth={2.5} />
                        )}
                      </div>
                      <p className="text-[10px] font-bold">W{w.weekIndex}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* 이번 주 카드 */}
          {currentWeek && (
            <div className="rounded-3xl bg-white border border-neutral-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-7 sm:p-8 mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-700 text-white font-black flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_6px_16px_-6px_rgba(0,0,0,0.4)]">
                  W{currentWeek.weekIndex}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold tracking-[1.5px] uppercase text-neutral-500 mb-1">
                    이번 주
                  </p>
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-900 leading-tight">
                    {currentWeek.title || `Week ${currentWeek.weekIndex}`}
                  </h2>
                </div>
              </div>
              <div className="text-[13px] text-neutral-600 mb-5 flex items-center gap-1.5 flex-wrap">
                <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>오픈 {formatKstHuman(currentWeek.openAt)}</span>
                <span className="mx-1 text-neutral-300">·</span>
                <span>마감 {formatKstHuman(currentWeek.homeworkDueAt)}</span>
              </div>
              {currentWeek.description && (
                <div
                  className="text-sm text-neutral-700 leading-relaxed prose prose-neutral prose-sm max-w-none mb-6"
                  dangerouslySetInnerHTML={{ __html: currentWeek.description }}
                />
              )}
              <Link
                href={`/challenge/${cohort.id}/week/${currentWeek.weekIndex}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800 shadow-[0_6px_20px_-6px_rgba(0,0,0,0.4)]"
              >
                Week {currentWeek.weekIndex} 열기 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* 전체 주차 리스트 (Apple 시스템 설정 스타일 리스트) */}
          <p className="text-[11px] font-bold tracking-[2px] uppercase text-neutral-500 px-2 mb-2">
            전체 주차
          </p>
          <div className="rounded-3xl bg-white border border-neutral-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
            {cohort.weeks.map((w, i) => {
              const opened = w.openAt.getTime() <= now.getTime();
              const sub = w.submissions[0];
              const submitted = sub && sub.status !== "draft";
              const isDraft = sub && sub.status === "draft";
              const isCurrent = w.id === currentWeek?.id;
              const isLast = i === cohort.weeks.length - 1;
              const inner = (
                <>
                  <div
                    className={
                      "shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-black text-[15px] " +
                      (opened
                        ? "bg-gradient-to-br from-neutral-900 to-neutral-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_10px_-4px_rgba(0,0,0,0.3)]"
                        : "bg-neutral-100 text-neutral-400")
                    }
                  >
                    W{w.weekIndex}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={"font-semibold truncate " + (opened ? "text-neutral-900" : "text-neutral-500")}>
                      {w.title || `Week ${w.weekIndex}`}
                    </p>
                    <p className="text-[11.5px] text-neutral-500 mt-0.5">
                      {opened ? formatKstHuman(w.openAt) : `${formatKstHuman(w.openAt)} 오픈 예정`}
                    </p>
                  </div>
                  {opened ? (
                    sub?.feedbackAt ? (
                      <span className="text-[10px] font-bold text-neutral-900 border border-neutral-900 rounded-full px-2 py-0.5 inline-flex items-center gap-1">
                        <MessageSquareText className="w-3 h-3" /> 피드백
                      </span>
                    ) : submitted ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
                        제출 완료
                      </span>
                    ) : isDraft ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">
                        작성 중(임시저장)
                      </span>
                    ) : isCurrent ? (
                      <span className="text-[10px] font-bold text-white bg-neutral-900 rounded-full px-2 py-0.5">
                        진행 중
                      </span>
                    ) : null
                  ) : null}
                  {opened ? (
                    <ArrowRight className="w-4 h-4 text-neutral-400 shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-neutral-300 shrink-0" />
                  )}
                </>
              );
              return opened ? (
                <Link
                  key={w.id}
                  href={`/challenge/${cohort.id}/week/${w.weekIndex}`}
                  className={
                    "flex items-center gap-4 px-5 py-4 hover:bg-neutral-50/80 transition-colors " +
                    (isLast ? "" : "border-b border-neutral-200/70")
                  }
                >
                  {inner}
                </Link>
              ) : (
                <div
                  key={w.id}
                  className={
                    "flex items-center gap-4 px-5 py-4 " +
                    (isLast ? "" : "border-b border-neutral-200/70")
                  }
                >
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
