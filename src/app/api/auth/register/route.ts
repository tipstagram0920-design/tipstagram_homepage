import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { upsertContactByEmail } from "@/lib/crm/contact";
import { logEvent } from "@/lib/crm/events";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "모든 필드를 입력해주세요." }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "이미 사용 중인 이메일입니다." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const role = normalizedEmail === process.env.ADMIN_EMAIL ? "ADMIN" : "USER";

    const contact = await upsertContactByEmail({ email: normalizedEmail, name, source: "register" });

    const user = await prisma.user.create({
      data: { name, email: normalizedEmail, password: hashed, role, contactId: contact.id },
    });

    await logEvent(contact.id, "register", { userId: user.id });

    return NextResponse.json({ id: user.id, email: user.email });
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
