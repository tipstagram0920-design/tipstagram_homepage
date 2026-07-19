import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatKstHuman } from "@/lib/kst";
import { ChevronLeft, Inbox } from "lucide-react";
import { SubmissionView } from "@/app/challenge/[cohortId]/week/[weekIndex]/SubmissionView";
import { FeedbackEditor } from "./_components/FeedbackEditor";

export const dynamic = "force-dynamic";

export default async function WeekSubmissionsPage({
  params,
}: {
  params: Promise<{ cohortId: string; weekId: string }>;
}) {
  const { cohortId, weekId } = await params;
  const week = await prisma.challengeWeek.findUnique({
    where: { id: weekId },
    include: { cohort: { select: { id: true, name: true } } },
  });
  if (!week || week.cohortId !== cohortId) notFound();

  const submissions = await prisma.homeworkSubmission.findMany({
    where: { weekId, status: { not: "draft" } },
    include: { user: { select: { name: true, email: true } } },
    orderBy: [{ feedbackAt: "asc" }, { submittedAt: "asc" }],
  });

  const pending = submissions.filter((s) => !s.feedbackAt).length;

  return (
    <div className="max-w-3xl">
      <Link
        href={`/admin/challenge/${cohortId}`}
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> {week.cohort.name}
      </Link>
      <h1 className="text-2xl font-black text-neutral-900 mb-1">
        Week {week.weekIndex} · 제출 &amp; 피드백
      </h1>
      <p className="text-sm text-neutral-500 mb-8">
        총 {submissions.length}건 · 피드백 대기 {pending}건
        {" · "}마감 {formatKstHuman(week.homeworkDueAt)}
      </p>

      {submissions.length === 0 ? (
        <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-neutral-100">
          <Inbox className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">아직 제출된 숙제가 없어요.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {submissions.map((s) => {
            const feedbackText =
              s.feedbackJson && typeof s.feedbackJson === "object" && "text" in s.feedbackJson
                ? String((s.feedbackJson as { text?: unknown }).text ?? "")
                : "";
            return (
              <div
                key={s.id}
                className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 space-y-4"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-bold text-neutral-900 truncate">
                      {s.user.name || "이름 없음"}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">{s.user.email}</p>
                  </div>
                  <span
                    className={
                      "text-[11px] font-bold rounded-full px-2.5 py-1 shrink-0 " +
                      (s.feedbackAt
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-pink-100 text-pink-700")
                    }
                  >
                    {s.feedbackAt ? "피드백 완료" : "피드백 대기"}
                  </span>
                </div>

                {/* 학생 제출 내용 (읽기 전용) */}
                <SubmissionView
                  content={s.content}
                  formData={s.formData}
                  imageUrls={s.imageUrls}
                  instagramUrl={s.instagramUrl}
                  submittedAt={s.submittedAt.toISOString()}
                />

                {/* 피드백 작성·발송 */}
                <FeedbackEditor
                  submissionId={s.id}
                  initialText={feedbackText}
                  hasFeedback={!!s.feedbackAt}
                  feedbackAtHuman={s.feedbackAt ? formatKstHuman(s.feedbackAt) : null}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
