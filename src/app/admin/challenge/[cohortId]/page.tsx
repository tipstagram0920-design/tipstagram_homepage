import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatKstHuman } from "@/lib/kst";
import { ChevronLeft, ChevronRight, Users, MessageSquareText, ExternalLink, Video } from "lucide-react";

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
        include: { _count: { select: { submissions: true } } },
      },
    },
  });
  if (!cohort) notFound();

  const enrolled = await prisma.purchase.count({
    where: { refundedAt: null, product: { slug: cohort.productSlug } },
  });

  const totalSubmissions = cohort.weeks.reduce((sum, w) => sum + w._count.submissions, 0);
  const pendingFeedback = await prisma.homeworkSubmission.count({
    where: { week: { cohortId }, status: "submitted" },
  });

  const now = new Date();

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
        <Link
          href={`/admin/challenge/${cohort.id}/submissions`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800"
        >
          <MessageSquareText className="w-4 h-4" /> 제출 리스트
        </Link>
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
                    <span>제출 {w._count.submissions}건</span>
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

      <div className="mt-8 rounded-2xl border border-neutral-100 bg-neutral-50 p-5">
        <p className="text-xs text-neutral-500 leading-relaxed">
          💡 참여자 페이지 URL:{" "}
          <Link
            href={`/challenge/${cohort.id}`}
            className="inline-flex items-center gap-1 text-pink-600 hover:text-pink-700 font-semibold"
          >
            /challenge/{cohort.id} <ExternalLink className="w-3 h-3" />
          </Link>
          <br />
          챌린지 상품 구매자만 접근할 수 있어요. 카톡·이메일 안내에 이 링크를 첨부해 주세요.
        </p>
      </div>
    </div>
  );
}
