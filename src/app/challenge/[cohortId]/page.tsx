import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { assertCohortEnrollment } from "@/lib/challenge-enrollment";
import { formatKstHuman } from "@/lib/kst";
import { CheckCircle2, Circle, Lock, Trophy, ArrowRight, MessageSquareText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ChallengeDashboardPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const session = await auth();
  const { cohortId } = await params;
  if (!session?.user?.id) redirect(`/login?redirect=/challenge/${cohortId}`);

  const enrolled = await assertCohortEnrollment(session.user.id, cohortId);
  if (!enrolled) notFound();

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

  // 이번 주차: 오늘이 openAt과 다음 주 openAt 사이인 주차. 없으면 첫 미오픈 주차.
  const currentWeek =
    cohort.weeks.find(
      (w, i) =>
        w.openAt.getTime() <= now.getTime() &&
        (i === cohort.weeks.length - 1 || cohort.weeks[i + 1].openAt.getTime() > now.getTime())
    ) ?? cohort.weeks[0];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-950 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-20">
          {/* Hero */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-[11px] sm:text-xs font-semibold mb-4">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              5주 챌린지
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              <span className="ig-gradient-text">{cohort.name}</span>
            </h1>
            <p className="text-sm text-white/60">
              Week 1 오픈 · {formatKstHuman(cohort.week1StartAt)}
            </p>
          </div>

          {/* 5주 진행바 */}
          <ol className="mb-10 flex items-center gap-2">
            {cohort.weeks.map((w) => {
              const opened = w.openAt.getTime() <= now.getTime();
              const submitted = w.submissions.length > 0;
              const feedback = w.submissions[0]?.feedbackAt;
              const isCurrent = w.id === currentWeek?.id;
              return (
                <li key={w.id} className="flex-1">
                  <div
                    className={
                      "h-1 rounded-full transition-all " +
                      (opened ? "ig-gradient" : "bg-white/10")
                    }
                  />
                  <div
                    className={
                      "mt-2 flex flex-col items-center gap-1 " +
                      (isCurrent ? "text-white" : "text-white/40")
                    }
                  >
                    <div
                      className={
                        "w-8 h-8 rounded-full flex items-center justify-center border-2 " +
                        (feedback
                          ? "border-green-400 bg-green-400/20"
                          : submitted
                            ? "border-pink-400 bg-pink-400/20"
                            : opened
                              ? "border-white/40 bg-white/5"
                              : "border-white/10 bg-transparent")
                      }
                    >
                      {feedback ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : submitted ? (
                        <Circle className="w-4 h-4 text-pink-400 fill-pink-400" />
                      ) : opened ? (
                        <Circle className="w-4 h-4" />
                      ) : (
                        <Lock className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <p className="text-[11px] font-bold">W{w.weekIndex}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* 이번 주 카드 */}
          {currentWeek && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 mb-6">
              <p className="text-xs font-bold tracking-[2px] text-pink-400 uppercase mb-2">
                이번 주 · Week {currentWeek.weekIndex}
              </p>
              <h2 className="text-2xl font-black mb-3">
                {currentWeek.title || `Week ${currentWeek.weekIndex}`}
              </h2>
              <p className="text-sm text-white/60 mb-4">
                오픈 · {formatKstHuman(currentWeek.openAt)}
                <span className="mx-2 text-white/30">·</span>
                마감 · {formatKstHuman(currentWeek.homeworkDueAt)}
              </p>
              {currentWeek.description && (
                <div
                  className="text-sm text-white/75 leading-relaxed prose prose-invert prose-sm max-w-none mb-6"
                  dangerouslySetInnerHTML={{ __html: currentWeek.description }}
                />
              )}
              <Link
                href={`/challenge/${cohort.id}/week/${currentWeek.weekIndex}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl ig-gradient text-white text-sm font-bold hover:opacity-90"
              >
                Week {currentWeek.weekIndex} 열기 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* 지난 주차 히스토리 */}
          <h3 className="text-sm font-bold text-white/70 mb-3 mt-8">전체 주차</h3>
          <ul className="space-y-2">
            {cohort.weeks.map((w) => {
              const opened = w.openAt.getTime() <= now.getTime();
              const submitted = w.submissions[0];
              const isCurrent = w.id === currentWeek?.id;
              return (
                <li key={w.id}>
                  {opened ? (
                    <Link
                      href={`/challenge/${cohort.id}/week/${w.weekIndex}`}
                      className={
                        "flex items-center gap-4 rounded-2xl border p-4 transition-colors " +
                        (isCurrent
                          ? "border-pink-400/50 bg-pink-500/10"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]")
                      }
                    >
                      <span className="shrink-0 w-10 h-10 rounded-xl ig-gradient text-white font-black flex items-center justify-center">
                        W{w.weekIndex}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white truncate">
                          {w.title || `Week ${w.weekIndex}`}
                        </p>
                        <p className="text-[11px] text-white/40 mt-0.5">
                          {formatKstHuman(w.openAt)}
                        </p>
                      </div>
                      {submitted?.feedbackAt ? (
                        <span className="text-[10px] font-bold text-green-400 bg-green-400/10 rounded-full px-2 py-0.5 inline-flex items-center gap-1">
                          <MessageSquareText className="w-3 h-3" /> 피드백 도착
                        </span>
                      ) : submitted ? (
                        <span className="text-[10px] font-bold text-pink-400 bg-pink-400/10 rounded-full px-2 py-0.5">
                          제출 완료
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-white/40">숙제 미제출</span>
                      )}
                      <ArrowRight className="w-4 h-4 text-white/30" />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.01] p-4 opacity-50">
                      <span className="shrink-0 w-10 h-10 rounded-xl bg-white/5 text-white/40 font-black flex items-center justify-center">
                        W{w.weekIndex}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white/60 truncate">
                          {w.title || `Week ${w.weekIndex}`}
                        </p>
                        <p className="text-[11px] text-white/30 mt-0.5">
                          {formatKstHuman(w.openAt)} 오픈 예정
                        </p>
                      </div>
                      <Lock className="w-4 h-4 text-white/30" />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
