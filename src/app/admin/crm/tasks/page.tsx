import { prisma } from "@/lib/prisma";
import { TasksClient } from "./TasksClient";

export const dynamic = "force-dynamic";

export default async function OperatorTasksPage() {
  const tasks = await prisma.operatorTask.findMany({
    orderBy: { scheduledAt: "asc" },
  });
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-neutral-900">운영 to-do</h1>
        <p className="text-sm text-neutral-500 mt-1">
          시각이 되면 운영자(본인) 이메일로 알림이 가요. 캠페인을 만들 때 12개 task가 자동 생성되고, 여기서 직접 추가도 할 수 있어요.
        </p>
      </div>
      <TasksClient
        initial={tasks.map((t) => ({
          id: t.id,
          title: t.title,
          detail: t.detail,
          scheduledAt: t.scheduledAt.toISOString(),
          status: t.status,
          campaignId: t.campaignId,
          notifiedAt: t.notifiedAt?.toISOString() ?? null,
          doneAt: t.doneAt?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
