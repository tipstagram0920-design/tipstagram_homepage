import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * 끝난 기수 자동 비활성화 (매일 1회).
 *
 * 기수를 손으로 안 끄면 챌린지 구매자 강의실에 지난 기수 카드가 계속 쌓인다(2026-10-08 에 5장).
 * 마지막 주차가 열리고 7일(= 그 주차 숙제 마감 + 하루)이 지나면 끝난 것으로 본다.
 * 비활성화해도 직접 링크·피드백 열람은 그대로다 — 강의실 카드 목록에서만 빠진다.
 */
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const active = await prisma.challengeCohort.findMany({
    where: { isActive: true },
    select: { id: true, name: true, weeks: { orderBy: { weekIndex: "desc" }, take: 1, select: { openAt: true } } },
  });
  const ended = active.filter((c) => c.weeks[0] && c.weeks[0].openAt < cutoff);
  if (ended.length) {
    await prisma.challengeCohort.updateMany({ where: { id: { in: ended.map((c) => c.id) } }, data: { isActive: false } });
  }
  return NextResponse.json({ deactivated: ended.map((c) => c.name) });
}
