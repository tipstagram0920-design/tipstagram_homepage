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

  const currentWeek =
    cohort.weeks.find(
      (w, i) =>
        w.openAt.getTime() <= now.getTime() &&
        (i === cohort.weeks.length - 1 || cohort.weeks[i + 1].openAt.getTime() > now.getTime())
    ) ?? cohort.weeks[0];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50 text-neutral-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-20">
          {/* Hero */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200 bg-white text-neutral-700 text-[11px] sm:text-xs font-semibold mb-4">
              <Trophy className="w-3.5 h-3.5 text-neutral-700" />
              5주 챌린지
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-neutral-900">
              {cohort.name}
            </h1>
            <p className="text-sm text-neutral-500">
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
                      (opened ? "bg-neutral-900" : "bg-neutral-200")
                    }
                  />
                  <div
                    className={
                      "mt-2 flex flex-col items-center gap-1 " +
                      (isCurrent ? "text-neutral-900" : "text-neutral-400")
                    }
                  >
                    <div
                      className={
                        "w-8 h-8 rounded-full flex items-center justify-center border-2 " +
                        (feedback
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : submitted
                            ? "border-neutral-900 bg-white text-neutral-900"
                            : opened
                              ? "border-neutral-300 bg-white text-neutral-500"
                              : "border-neutral-200 bg-neutral-50 text-neutral-400")
                      }
                    >
                      {feedback ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : submitted ? (
                        <Circle className="w-4 h-4 fill-neutral-900" />
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
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 mb-6">
              <p className="text-xs font-bold tracking-[2px] text-neutral-500 uppercase mb-2">
                이번 주 · Week {currentWeek.weekIndex}
              </p>
              <h2 className="text-2xl font-black mb-3 text-neutral-900">
                {currentWeek.title || `Week ${currentWeek.weekIndex}`}
              </h2>
              <p className="text-sm text-neutral-500 mb-4">
                오픈 · {formatKstHuman(currentWeek.openAt)}
                <span className="mx-2 text-neutral-300">·</span>
                마감 · {formatKstHuman(currentWeek.homeworkDueAt)}
              </p>
              {currentWeek.description && (
                <div
                  className="text-sm text-neutral-700 leading-relaxed prose prose-neutral prose-sm max-w-none mb-6"
                  dangerouslySetInnerHTML={{ __html: currentWeek.description }}
                />
              )}
              <Link
                href={`/challenge/${cohort.id}/week/${currentWeek.weekIndex}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800"
              >
                Week {currentWeek.weekIndex} 열기 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* 지난 주차 히스토리 */}
          <h3 className="text-sm font-bold text-neutral-700 mb-3 mt-8">전체 주차</h3>
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
                          ? "border-neutral-900 bg-white"
                          : "border-neutral-200 bg-white hover:border-neutral-400")
                      }
                    >
                      <span className="shrink-0 w-10 h-10 rounded-xl bg-neutral-900 text-white font-black flex items-center justify-center">
                        W{w.weekIndex}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-neutral-900 truncate">
                          {w.title || `Week ${w.weekIndex}`}
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          {formatKstHuman(w.openAt)}
                        </p>
                      </div>
                      {submitted?.feedbackAt ? (
                        <span className="text-[10px] font-bold text-neutral-900 border border-neutral-900 rounded-full px-2 py-0.5 inline-flex items-center gap-1">
                          <MessageSquareText className="w-3 h-3" /> 피드백 도착
                        </span>
                      ) : submitted ? (
                        <span className="text-[10px] font-bold text-neutral-700 bg-neutral-100 rounded-full px-2 py-0.5">
                          제출 완료
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-neutral-400">숙제 미제출</span>
                      )}
                      <ArrowRight className="w-4 h-4 text-neutral-400" />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 opacity-70">
                      <span className="shrink-0 w-10 h-10 rounded-xl bg-neutral-200 text-neutral-500 font-black flex items-center justify-center">
                        W{w.weekIndex}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-neutral-500 truncate">
                          {w.title || `Week ${w.weekIndex}`}
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          {formatKstHuman(w.openAt)} 오픈 예정
                        </p>
                      </div>
                      <Lock className="w-4 h-4 text-neutral-400" />
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
