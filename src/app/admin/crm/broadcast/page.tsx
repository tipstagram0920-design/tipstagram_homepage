import { prisma } from "@/lib/prisma";
import { BroadcastClient } from "./BroadcastClient";

export const dynamic = "force-dynamic";

export default async function BroadcastPage() {
  const drafts = await prisma.broadcastDraft.findMany({
    orderBy: { scheduledAt: "asc" },
  });
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-neutral-900">예약 메시지 보드</h1>
        <p className="text-sm text-neutral-500 mt-1">
          카카오 오픈채팅 등 봇 발송이 불가능한 채널의 메시지를 예약해두면, 발송 시각에 운영자에게 알림이 옵니다. 본문은 복사해서 직접 붙여넣어 주세요.
        </p>
      </div>
      <BroadcastClient
        initial={drafts.map((d) => ({
          id: d.id,
          channel: d.channel,
          title: d.title,
          body: d.body,
          scheduledAt: d.scheduledAt.toISOString(),
          status: d.status,
          notifiedAt: d.notifiedAt?.toISOString() ?? null,
          doneAt: d.doneAt?.toISOString() ?? null,
          notes: d.notes,
        }))}
      />
    </div>
  );
}
