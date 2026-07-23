import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { upsertContactByEmail } from "@/lib/crm/contact";
import { logEvent } from "@/lib/crm/events";
import { triggerWorkflow } from "@/lib/crm/workflow-engine";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, marketingConsent } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "모든 필드를 입력해주세요." }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPhone = phone ? String(phone).replace(/[^\d+]/g, "").replace(/^\+82/, "0") : "";
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "이미 사용 중인 이메일입니다." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const role = normalizedEmail === process.env.ADMIN_EMAIL ? "ADMIN" : "USER";

    const contact = await upsertContactByEmail({
      email: normalizedEmail,
      name,
      phone: normalizedPhone || undefined,
      source: "register",
    });
    // 카카오톡 마케팅 수신 동의 (알림톡/친구톡 발송 게이팅에 사용)
    if (marketingConsent === true) {
      await prisma.contact.update({ where: { id: contact.id }, data: { consentSms: true } });
    }

    const user = await prisma.user.create({
      data: { name, email: normalizedEmail, password: hashed, role, contactId: contact.id },
    });

    await logEvent(contact.id, "register", { userId: user.id });
    await triggerWorkflow("register", contact.id, { userId: user.id });

    return NextResponse.json({ id: user.id, email: user.email });
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
