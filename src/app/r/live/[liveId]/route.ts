import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseUnsubscribeToken } from "@/lib/crm/unsubscribe-token";

export const dynamic = "force-dynamic";

/**
 * 라이브 입장 링크 — 클릭을 남기고 유튜브로 보낸다. 참석을 직접 알 길이 없어 '입장 클릭'을 참석의 근사치로 쓴다.
 *  · 메일: `?t=<컨택트 토큰>` 이 붙어 누가 눌렀는지 안다(구독해지 토큰 재사용 — 이메일을 URL 에 노출하지 않는다)
 *  · 카톡·기타: 토큰 없음 → 익명 카운트
 * 라이브가 없거나 링크가 비면 /live 로 보낸다. 기록 실패가 입장을 막으면 안 된다.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ liveId: string }> }) {
  const { liveId } = await params;
  const live = await prisma.liveEvent.findUnique({ where: { id: liveId }, select: { youtubeUrl: true, replayUrl: true } }).catch(() => null);
  const dest = live?.youtubeUrl || live?.replayUrl || "/live";

  const t = req.nextUrl.searchParams.get("t");
  const email = t ? parseUnsubscribeToken(t) : null;
  try {
    const contact = email ? await prisma.contact.findUnique({ where: { email }, select: { id: true } }) : null;
    await prisma.liveEnterClick.create({
      data: { liveId, contactId: contact?.id ?? null, email, via: email ? "email" : req.nextUrl.searchParams.get("via") || "kakao" },
    });
  } catch {
    /* 기록은 부가 기능이다 */
  }
  return NextResponse.redirect(dest.startsWith("http") ? dest : new URL(dest, req.url), { status: 302 });
}
