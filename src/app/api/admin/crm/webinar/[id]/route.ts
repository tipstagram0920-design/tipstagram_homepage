import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasUrlLinkChange, reseedCampaignSequences } from "@/lib/crm/campaign-reseed";

async function requireAdmin() {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.webinarCampaign.findUnique({
    where: { id },
    select: {
      zoomUrl: true,
      salesUrl: true,
      kakaoChatUrl: true,
      replayUrl: true,
      preQuestionUrl: true,
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "campaign not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") data.name = body.name;
  if (body.webinarDate) data.webinarDate = new Date(body.webinarDate);
  if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;
  const extractFirstUrl = (v: string | null | undefined): string | null => {
    if (!v) return null;
    const m = v.match(/https?:\/\/\S+/);
    return m ? m[0] : v.trim() || null;
  };
  if (body.zoomUrl !== undefined) data.zoomUrl = extractFirstUrl(body.zoomUrl);
  if (body.salesUrl !== undefined) data.salesUrl = extractFirstUrl(body.salesUrl);
  if (body.kakaoChatUrl !== undefined) data.kakaoChatUrl = extractFirstUrl(body.kakaoChatUrl);
  if (body.replayUrl !== undefined) data.replayUrl = extractFirstUrl(body.replayUrl);
  if (body.preQuestionUrl !== undefined) {
    const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://tipstagram-homepage.vercel.app";
    data.preQuestionUrl = body.preQuestionUrl?.trim() || `${SITE}/webinar/ask/${id}`;
  }
  if (body.audience !== undefined) data.audience = body.audience;
  if (body.steps !== undefined) data.steps = body.steps;
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (typeof body.skipPast === "boolean") data.skipPast = body.skipPast;
  const campaign = await prisma.webinarCampaign.update({ where: { id }, data });

  // URL·링크 필드가 하나라도 바뀌었으면 이메일 시퀀스와 카톡 draft를 자동 재시드.
  // 카톡 draft body에는 URL이 저장 시점에 embed돼 있어 재생성이 필수이고,
  // 이메일 steps도 프리셋 최신본으로 맞춰둔다.
  let reseed: Awaited<ReturnType<typeof reseedCampaignSequences>> | null = null;
  if (hasUrlLinkChange(body, existing)) {
    try {
      reseed = await reseedCampaignSequences(id);
    } catch (e) {
      console.error("[webinar] reseed 실패:", e);
    }
  }

  return NextResponse.json({ campaign, reseed });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;
  const { id } = await params;
  await prisma.webinarCampaign.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
