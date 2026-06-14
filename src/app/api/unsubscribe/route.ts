import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseUnsubscribeToken } from "@/lib/crm/unsubscribe-token";
import { logEvent } from "@/lib/crm/events";

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}));
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "토큰이 없습니다." }, { status: 400 });
  }
  const email = parseUnsubscribeToken(token);
  if (!email) {
    return NextResponse.json({ error: "토큰이 유효하지 않습니다." }, { status: 400 });
  }
  const contact = await prisma.contact.findUnique({ where: { email } });
  if (!contact) {
    return NextResponse.json({ error: "해당 이메일의 컨택트가 없습니다." }, { status: 404 });
  }
  if (contact.unsubscribedAt) {
    return NextResponse.json({ ok: true, alreadyUnsubscribed: true });
  }
  await prisma.contact.update({
    where: { id: contact.id },
    data: { unsubscribedAt: new Date(), consentEmail: false },
  });
  await logEvent(contact.id, "unsubscribe", { via: "email_link" });
  return NextResponse.json({ ok: true });
}
