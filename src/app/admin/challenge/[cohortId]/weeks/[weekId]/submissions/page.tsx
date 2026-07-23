import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatKstHuman } from "@/lib/kst";
import { ChevronLeft, ChevronRight, Inbox, List } from "lucide-react";
import { SubmissionView } from "@/app/challenge/[cohortId]/week/[weekIndex]/SubmissionView";
import { FeedbackEditor } from "./_components/FeedbackEditor";
import { SendAllFeedbackButton } from "./_components/SendAllFeedbackButton";
import { GenerateAllButton } from "./_components/GenerateAllButton";

export const dynamic = "force-dynamic";

type SubmissionRow = Awaited<ReturnType<typeof loadSubmissions>>[number];

function loadSubmissions(weekId: string) {
  return prisma.homeworkSubmission.findMany({
    where: { weekId },
    include: { user: { select: { name: true, email: true } } },
    orderBy: [{ status: "asc" }, { feedbackAt: "asc" }, { submittedAt: "asc" }],
  });
}

function SubmissionCard({ s }: { s: SubmissionRow }) {
  const feedbackText =
    s.feedbackJson && typeof s.feedbackJson === "object" && "text" in s.feedbackJson
      ? String((s.feedbackJson as { text?: unknown }).text ?? "")
      : "";
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="font-bold text-neutral-900 truncate">{s.user.name || "이름 없음"}</p>
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

      <SubmissionView
        content={s.content}
        formData={s.formData}
        imageUrls={s.imageUrls}
        instagramUrl={s.instagramUrl}
        submittedAt={s.submittedAt.toISOString()}
      />

      {s.status === "draft" && (
        <p className="text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          아직 임시저장(작성 중) 상태예요. 그래도 피드백을 만들어 보낼 수 있어요 — 전송하면 학생에게 공개됩니다.
        </p>
      )}
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
    </div>
  );
}

export default async function WeekSubmissionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ cohortId: string; weekId: string }>;
  searchParams: Promise<{ u?: string }>;
}) {
  const { cohortId, weekId } = await params;
  const { u } = await searchParams;
  const week = await prisma.challengeWeek.findUnique({
    where: { id: weekId },
    include: { cohort: { select: { id: true, name: true } } },
  });
  if (!week || week.cohortId !== cohortId) notFound();

  const submissions = await loadSubmissions(weekId);

  const submittedList = submissions.filter((s) => s.status !== "draft");
  const draftCount = submissions.length - submittedList.length;
  const pending = submittedList.filter((s) => !s.feedbackAt).length;
  const readyToSend = submissions.filter((s) => !s.feedbackAt && !!s.feedbackHtml).length;

  const base = `/admin/challenge/${cohortId}/weeks/${weekId}/submissions`;

  // 단일 학생 집중 보기
  const focusIndex = u ? submissions.findIndex((s) => s.userId === u) : -1;
  const focused = focusIndex >= 0 ? submissions[focusIndex] : null;
  const prev = focused && focusIndex > 0 ? submissions[focusIndex - 1] : null;
  const next = focused && focusIndex < submissions.length - 1 ? submissions[focusIndex + 1] : null;

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

      {submissions.length === 0 ? (
        <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-neutral-100">
          <Inbox className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">아직 제출된 숙제가 없어요.</p>
        </div>
      ) : focused ? (
        /* ─── 단일 학생 집중 보기 ─── */
        <>
          <div className="flex items-center justify-between gap-2 mb-4">
            <Link
              href={base}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-neutral-900"
            >
              <List className="w-4 h-4" /> 전체 목록
            </Link>
            <span className="text-xs text-neutral-400">
              {focusIndex + 1} / {submissions.length}
            </span>
            <div className="flex items-center gap-1.5">
              {prev ? (
                <Link
                  href={`${base}?u=${prev.userId}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-sm font-semibold text-neutral-700 hover:border-neutral-900"
                >
                  <ChevronLeft className="w-4 h-4" /> 이전
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-100 text-sm text-neutral-300">
                  <ChevronLeft className="w-4 h-4" /> 이전
                </span>
              )}
              {next ? (
                <Link
                  href={`${base}?u=${next.userId}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-sm font-semibold text-neutral-700 hover:border-neutral-900"
                >
                  다음 <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-100 text-sm text-neutral-300">
                  다음 <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </div>
          </div>

          <SubmissionCard s={focused} />

          {/* 하단에도 다음 학생으로 넘기는 버튼 (스크롤 후 편의) */}
          {next && (
            <div className="mt-4 flex justify-end">
              <Link
                href={`${base}?u=${next.userId}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800"
              >
                다음 학생 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </>
      ) : (
        /* ─── 전체 목록 ─── */
        <>
          {pending > 0 && (
            <div className="flex items-center justify-between gap-3 flex-wrap rounded-2xl border border-violet-200 bg-violet-50/50 px-4 py-3 mb-4">
              <p className="text-sm text-neutral-700">
                미발송 제출 <strong className="text-violet-700">{pending}건</strong>에 대해 AI 피드백 초안을 한 번에 만들 수 있어요.
              </p>
              <GenerateAllButton weekId={week.id} count={pending} />
            </div>
          )}

          {readyToSend > 0 && (
            <div className="flex items-center justify-between gap-3 flex-wrap rounded-2xl border border-pink-200 bg-pink-50/50 px-4 py-3 mb-8">
              <p className="text-sm text-neutral-700">
                저장해둔 피드백 <strong className="text-pink-600">{readyToSend}건</strong>이 아직 미발송이에요. 검토 후 한 번에 보내세요.
              </p>
              <SendAllFeedbackButton weekId={week.id} count={readyToSend} />
            </div>
          )}

          <div className="space-y-4">
            {submissions.map((s) => (
              <div key={s.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400">{s.user.name || s.user.email}</span>
                  <Link
                    href={`${base}?u=${s.userId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-pink-600 hover:text-pink-700"
                  >
                    이 학생만 보기 <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <SubmissionCard s={s} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
