import { prisma } from "@/lib/prisma";

/**
 * 이 사용자가 해당 컨설팅 할 일(task)을 수정할 권한이 있는지 확인.
 * 소유자(등록한 본인) 또는 관리자면 허용.
 */
export async function canEditTask(
  taskId: string,
  userId: string,
  isAdmin: boolean
): Promise<{ ok: boolean; enrollmentId?: string }> {
  const task = await prisma.consultingTask.findUnique({
    where: { id: taskId },
    select: { enrollmentId: true, enrollment: { select: { userId: true } } },
  });
  if (!task) return { ok: false };
  if (isAdmin || task.enrollment.userId === userId) {
    return { ok: true, enrollmentId: task.enrollmentId };
  }
  return { ok: false };
}
