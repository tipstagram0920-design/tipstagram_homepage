import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** 맥의 카톡 자동화가 "이 라이브로 캠페인·공지를 예약했다"고 알려오는 곳. 관제탑 체크리스트가 이걸 본다. */
export async function POST(req: NextRequest) {
  const secret = process.env.EXTERNAL_PURCHASE_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { liveId?: string; note?: string; version?: string } | null;
  if (!body?.liveId) return NextResponse.json({ error: "liveId 필요" }, { status: 400 });
  try {
    await prisma.liveEvent.update({
      where: { id: body.liveId },
      data: { kakaoQueuedAt: new Date(), kakaoNote: (body.note ?? "").slice(0, 200) || null, kakaoVersion: body.version ?? null },
    });
  } catch {
    return NextResponse.json({ error: "live not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
