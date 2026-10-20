import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { liveContentVersion } from "@/lib/live-ops";

export const dynamic = "force-dynamic";

/**
 * 맥에서 도는 카톡 자동화(auto kakao)가 5분마다 가져가는 "현재 라이브".
 *
 * 홈페이지(Vercel)는 맥에 접속할 수 없으니 맥이 당겨간다(pull). 입장 링크가 섞여 있어 공개하지 않고,
 * 결제 웹훅과 같은 공유 시크릿을 Bearer 로 받는다. 관제탑에서 저장하면 updatedAt 이 바뀌고,
 * 맥은 그걸 보고 캠페인을 다시 만든다.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.EXTERNAL_PURCHASE_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://tipstagram-homepage.vercel.app";
  const live = await prisma.liveEvent.findFirst({
    where: { isActive: true, startsAt: { gte: new Date(Date.now() - 3 * 60 * 60 * 1000) } },
    orderBy: { startsAt: "asc" },
    include: { campaign: { select: { preQuestionUrl: true, salesUrl: true } }, cohort: { select: { week1StartAt: true, openChatUrl: true } } },
  });
  if (!live) return NextResponse.json({ live: null });
  return NextResponse.json({
    live: {
      id: live.id,
      title: live.title,
      startsAt: live.startsAt.toISOString(),
      youtubeUrl: live.youtubeUrl,
      replayUrl: live.replayUrl,
      salesCloseAt: live.salesCloseAt?.toISOString() ?? null,
      chatUrl: live.chatUrl,
      preQuestionUrl: live.campaign?.preQuestionUrl ?? null,
      salesUrl: live.campaign?.salesUrl ?? `${site}/courses/5-week-challenge`,
      cohortStartAt: live.cohort?.week1StartAt?.toISOString() ?? null,
      cohortChatUrl: live.cohort?.openChatUrl ?? null,
      updatedAt: live.updatedAt.toISOString(),
      version: liveContentVersion(live),
    },
  });
}
