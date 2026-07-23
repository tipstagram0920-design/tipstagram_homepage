import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatKstHuman } from "@/lib/kst";
import { ChevronLeft, Inbox } from "lucide-react";
import { SubmissionView } from "@/app/challenge/[cohortId]/week/[weekIndex]/SubmissionView";
import { FeedbackEditor } from "./_components/FeedbackEditor";
import { SendAllFeedbackButton } from "./_components/SendAllFeedbackButton";

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
    where: { weekId },
    include: { user: { select: { name: true, email: true } } },
    orderBy: [{ status: "asc" }, { feedbackAt: "asc" }, { submittedAt: "asc" }],
  });

  const submittedList = submissions.filter((s) => s.status !== "draft");
  const draftCount = submissions.length - submittedList.length;
  const pending = submittedList.filter((s) => !s.feedbackAt).length;
  // 저장만 되고 미발송인 피드백 (일괄 전송 대상)
  const readyToSend = submissions.filter((s) => !s.feedbackAt && !!s.feedbackHtml).length;

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
      <p className="text-sm text-neutral-500 mb-4">
        제출 {submittedList.length}건 · 작성 중 {draftCount}건 · 피드백 대기 {pending}건
        {" · "}마감 {formatKstHuman(week.homeworkDueAt)}
      </p>

      {readyToSend > 0 && (
        <div className="flex items-center justify-between gap-3 flex-wrap rounded-2xl border border-pink-200 bg-pink-50/50 px-4 py-3 mb-8">
          <p className="text-sm text-neutral-700">
            저장해둔 피드백 <strong className="text-pink-600">{readyToSend}건</strong>이 아직 미발송이에요. 검토 후 한 번에 보내세요.
          </p>
          <SendAllFeedbackButton weekId={week.id} count={readyToSend} />
        </div>
      )}

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
                id={`u-${s.userId}`}
                className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 space-y-4 scroll-mt-24 target:ring-2 target:ring-pink-400 target:ring-offset-2"
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
                      (s.status === "draft"
                        ? "bg-amber-50 text-amber-700"
                        : s.feedbackAt
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-pink-100 text-pink-700")
                    }
                  >
                    {s.status === "draft" ? "작성 중(임시저장)" : s.feedbackAt ? "피드백 완료" : "피드백 대기"}
                  </span>
                </div>

                {/* 학생 제출 내용 (읽기 전용) — 작성 중이면 현재까지 작성분 */}
                <SubmissionView
                  content={s.content}
                  formData={s.formData}
                  imageUrls={s.imageUrls}
                  instagramUrl={s.instagramUrl}
                  submittedAt={s.submittedAt.toISOString()}
                />

                {/* 피드백: 정식 제출한 건만. 작성 중이면 안내 */}
                {s.status === "draft" ? (
                  <p className="text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    아직 정식 제출 전이에요 (임시저장). 학생이 제출을 완료하면 피드백을 보낼 수 있어요.
                  </p>
                ) : (
                  <FeedbackEditor
                    submissionId={s.id}
                    initialText={feedbackText}
                    hasFeedback={!!s.feedbackAt}
                    hasDraft={!s.feedbackAt && !!s.feedbackHtml}
                    isAuto={
                      !s.feedbackAt &&
                      !!s.feedbackJson &&
                      typeof s.feedbackJson === "object" &&
                      "auto" in s.feedbackJson &&
                      !!(s.feedbackJson as { auto?: unknown }).auto
                    }
                    feedbackAtHuman={s.feedbackAt ? formatKstHuman(s.feedbackAt) : null}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
