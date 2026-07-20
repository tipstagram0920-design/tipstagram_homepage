import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatKstHuman } from "@/lib/kst";
import { currentDayIndex, CONSULTING_DURATION_DAYS } from "@/lib/consulting";
import { TaskBoard, type BoardTask } from "@/components/consulting/TaskBoard";
import { ChevronLeft } from "lucide-react";
import { ResetTasksButton } from "./_components/ResetTasksButton";
import { AdminResults } from "./_components/AdminResults";

export const dynamic = "force-dynamic";

export default async function AdminConsultingEnrollmentPage({
  params,
}: {
  params: Promise<{ enrollmentId: string }>;
}) {
  const { enrollmentId } = await params;
  const enrollment = await prisma.consultingEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      user: { select: { name: true, email: true } },
      tasks: { orderBy: [{ day: "asc" }, { order: "asc" }] },
    },
  });
  if (!enrollment) notFound();

  const tasks: BoardTask[] = enrollment.tasks.map((t) => ({
    id: t.id,
    day: t.day,
    endDay: t.endDay,
    order: t.order,
    title: t.title,
    description: t.description,
    doneAt: t.doneAt ? t.doneAt.toISOString() : null,
    guideKey: t.guideKey,
    data: t.data,
  }));
  const dayIdx = currentDayIndex(enrollment.startAt);

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/consulting"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> 컨설팅 목록
      </Link>
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">
            {enrollment.user.name || "이름 없음"}
          </h1>
          <p className="text-sm text-neutral-500">
            {enrollment.user.email} · 시작 {formatKstHuman(enrollment.startAt)} ·{" "}
            {dayIdx < 1
              ? "시작 전"
              : dayIdx > CONSULTING_DURATION_DAYS
                ? "완료"
                : `현재 Day ${dayIdx}`}
          </p>
        </div>
        <ResetTasksButton enrollmentId={enrollment.id} />
      </div>

      {/* 고객 제출 결과 — 클릭하면 결과가 펼쳐집니다 */}
      <h2 className="text-lg font-bold text-neutral-900 mb-2">숙제 제출 결과</h2>
      <p className="text-xs text-neutral-500 mb-3">각 숙제를 클릭하면 고객이 작성한 내용·결과를 볼 수 있어요.</p>
      <AdminResults
        tasks={tasks.map((t) => ({
          id: t.id,
          day: t.day,
          title: t.title,
          guideKey: t.guideKey ?? null,
          data: t.data,
          doneAt: t.doneAt,
        }))}
      />

      <h2 className="text-lg font-bold text-neutral-900 mb-2">일정 편집</h2>
      <TaskBoard
        startAtIso={enrollment.startAt.toISOString()}
        durationDays={CONSULTING_DURATION_DAYS}
        tasks={tasks}
        manageEnrollmentId={enrollment.id}
      />
    </div>
  );
}
