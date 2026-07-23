import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMessage } from "@/lib/messaging";
import type { Channel } from "@/lib/messaging/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_RECIPIENTS = 500; // 회당 발송 상한(타임아웃·오발송 방지)

export async function POST(req: NextRequest) {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    channel?: string;
    tags?: string[];
    templateKey?: string;
    body?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const channel = body.channel as Channel;
  if (channel !== "kakao_alimtalk" && channel !== "kakao_friendtalk") {
    return NextResponse.json({ error: "채널은 알림톡 또는 친구톡이어야 합니다." }, { status: 400 });
  }
  const text = (body.body || "").trim();
  if (!text) return NextResponse.json({ error: "메시지 내용을 입력해 주세요." }, { status: 400 });
  const templateKey = (body.templateKey || "").trim() || undefined;
  if (channel === "kakao_alimtalk" && !templateKey) {
    return NextResponse.json(
      { error: "알림톡은 카카오 승인 템플릿 코드(templateKey)가 필요합니다." },
      { status: 400 }
    );
  }
  const tags = (body.tags || []).map((t) => t.trim()).filter(Boolean);

  // 알림톡: 정보성으로 취급(수신동의 없이 발송 가능). 친구톡: 마케팅 → consentSms 필수 + 미구독만.
  const isAlimtalk = channel === "kakao_alimtalk";

  const where: {
    phone: { not: null };
    tags?: { hasSome: string[] };
    consentSms?: boolean;
    unsubscribedAt?: null;
  } = { phone: { not: null } };
  if (tags.length > 0) where.tags = { hasSome: tags };
  if (!isAlimtalk) {
    where.consentSms = true;
    where.unsubscribedAt = null;
  }

  const recipients = await prisma.contact.findMany({
    where,
    select: { id: true, phone: true, name: true },
    take: MAX_RECIPIENTS + 1,
  });

  const capped = recipients.length > MAX_RECIPIENTS;
  const targets = recipients.slice(0, MAX_RECIPIENTS).filter((c) => c.phone && c.phone.trim());

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const c of targets) {
    // {{name}} 치환
    const personalized = text.replaceAll("{{name}}", c.name || "회원");
    const result = await sendMessage({
      to: c.phone as string,
      contactId: c.id,
      body: personalized,
      templateKey,
      channel,
      transactional: isAlimtalk,
    });
    if (result.ok) sent++;
    else {
      failed++;
      if (errors.length < 5 && result.error) errors.push(result.error);
    }
  }

  return NextResponse.json({
    ok: true,
    total: targets.length,
    sent,
    failed,
    capped,
    errors,
  });
}
