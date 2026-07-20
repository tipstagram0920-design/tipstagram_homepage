import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatKstHuman } from "@/lib/kst";
import { currentDayIndex, CONSULTING_DURATION_DAYS } from "@/lib/consulting";
import { TaskBoard, type BoardTask } from "@/components/consulting/TaskBoard";
import { ChevronLeft } from "lucide-react";
import { ResetTasksButton } from "./_components/ResetTasksButton";

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

      <TaskBoard
        startAtIso={enrollment.startAt.toISOString()}
        durationDays={CONSULTING_DURATION_DAYS}
        tasks={tasks}
        manageEnrollmentId={enrollment.id}
      />
    </div>
  );
}
