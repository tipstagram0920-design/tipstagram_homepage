import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "모든 필드를 입력해주세요." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "이미 사용 중인 이메일입니다." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    // 이메일이 ADMIN_EMAIL과 일치하면 ADMIN 권한 부여
    const role = email === process.env.ADMIN_EMAIL ? "ADMIN" : "USER";

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
    });

    return NextResponse.json({ id: user.id, email: user.email });
  } catch (error) {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
