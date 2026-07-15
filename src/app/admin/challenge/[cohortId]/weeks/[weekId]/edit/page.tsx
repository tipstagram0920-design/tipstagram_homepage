import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChevronLeft } from "lucide-react";
import { WeekEditor } from "./WeekEditor";

export const dynamic = "force-dynamic";

export default async function WeekEditPage({
  params,
}: {
  params: Promise<{ cohortId: string; weekId: string }>;
}) {
  const { cohortId, weekId } = await params;
  const week = await prisma.challengeWeek.findUnique({
    where: { id: weekId },
    include: { cohort: { select: { id: true, name: true, productSlug: true } } },
  });
  if (!week || week.cohortId !== cohortId) notFound();

  // 추천 강의 후보: marketing-booster 66강
  const booster = await prisma.product.findUnique({
    where: { slug: "marketing-booster" },
    include: {
      course: {
        include: {
          sections: {
            orderBy: { order: "asc" },
            include: { lessons: { orderBy: { order: "asc" }, select: { id: true, title: true } } },
          },
        },
      },
    },
  });

  const lessonChoices =
    booster?.course?.sections.flatMap((s) =>
      s.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        sectionTitle: s.title,
      }))
    ) ?? [];

  return (
    <div>
      <Link
        href={`/admin/challenge/${cohortId}`}
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> {week.cohort.name}
      </Link>
      <h1 className="text-2xl font-black text-neutral-900 mb-2">
        Week {week.weekIndex} · 편집
      </h1>
      <p className="text-sm text-neutral-500 mb-8">
        오픈 시각·라이브 URL·숙제 프롬프트를 세팅해 두면 참여자에게 자동으로 안내됩니다.
      </p>
      <WeekEditor
        initial={{
          id: week.id,
          title: week.title,
          description: week.description,
          homeworkPrompt: week.homeworkPrompt,
          openAtIso: week.openAt.toISOString(),
          homeworkDueAtIso: week.homeworkDueAt.toISOString(),
          liveAtIso: week.liveAt?.toISOString() ?? null,
          zoomUrl: week.zoomUrl ?? "",
          recordingUrl: week.recordingUrl ?? "",
          recommendedLessonIds: Array.isArray(week.recommendedLessonIds)
            ? (week.recommendedLessonIds as string[])
            : [],
          externalVideos: Array.isArray(week.externalVideos)
            ? (week.externalVideos as Array<{ title: string; url: string; description?: string }>)
            : [],
        }}
        lessonChoices={lessonChoices}
      />
    </div>
  );
}
