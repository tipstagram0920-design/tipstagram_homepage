import { prisma } from "@/lib/prisma";
import { liveOpsChecklist } from "@/lib/live-ops";
import { toKstLocalDateTime } from "@/lib/kst";
import { LiveOpsClient } from "./LiveOpsClient";

export const dynamic = "force-dynamic";

/**
 * 라이브 관제탑 — 무료 라이브 한 회차를 여기서만 관리한다.
 * 저장하면 /live 랜딩·메일 캠페인·카톡 문안·챌린지 기수·팁스킷/광고 랜딩이 전부 따라온다.
 */
export default async function LiveOpsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;

  const [lives, cohorts] = await Promise.all([
    prisma.liveEvent.findMany({ orderBy: { startsAt: "desc" }, take: 12, select: { id: true, title: true, startsAt: true } }),
    prisma.challengeCohort.findMany({
      where: { isActive: true },
      orderBy: { week1StartAt: "desc" },
      select: { id: true, name: true, week1StartAt: true, openChatUrl: true },
    }),
  ]);

  // 선택된 회차, 없으면 다음 라이브, 그것도 없으면 빈 폼
  const current = id
    ? await prisma.liveEvent.findUnique({ where: { id }, include: { cohort: true } })
    : await prisma.liveEvent.findFirst({
        where: { isActive: true, startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        include: { cohort: true },
      });
  const checklist = current ? await liveOpsChecklist(current.id) : [];

  const iso = (d: Date | null | undefined) => (d ? toKstLocalDateTime(d.toISOString()) : "");

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-2">라이브 관제탑</h1>
      <p className="text-sm text-neutral-500 mb-8">
        무료 라이브 한 회차를 여기서만 입력하세요. 저장하면 신청 페이지 · 메일 11단계 · 카톡 문안 · 챌린지 기수 ·
        팁스킷/광고 랜딩이 한 번에 맞춰집니다.
      </p>
      <LiveOpsClient
        lives={lives.map((l) => ({ id: l.id, title: l.title, startsAt: l.startsAt.toISOString() }))}
        cohorts={cohorts.map((c) => ({ id: c.id, name: c.name, week1StartAt: c.week1StartAt.toISOString(), openChatUrl: c.openChatUrl }))}
        initial={
          current
            ? {
                id: current.id,
                title: current.title,
                startsAt: iso(current.startsAt),
                youtubeUrl: current.youtubeUrl ?? "",
                replayUrl: current.replayUrl ?? "",
                signupCloseAt: iso(current.signupCloseAt),
                salesCloseAt: iso(current.salesCloseAt),
                chatUrl: current.chatUrl ?? "",
                cohortId: current.cohortId ?? "",
                cohortChatUrl: current.cohort?.openChatUrl ?? "",
                campaignId: current.campaignId,
              }
            : null
        }
        checklist={checklist}
      />
    </div>
  );
}
