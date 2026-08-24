import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { consumeResetToken, verifyResetToken } from "@/lib/password-reset";

const MIN_LENGTH = 8;

/** 토큰 유효성만 확인 (재설정 페이지 진입 시) */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  const email = await verifyResetToken(token);
  if (!email) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
  return NextResponse.json({ valid: true });
}

export async function POST(req: NextRequest) {
  let token = "";
  let password = "";
  try {
    const body = await req.json();
    token = typeof body?.token === "string" ? body.token : "";
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (password.length < MIN_LENGTH) {
    return NextResponse.json(
      { error: `비밀번호는 ${MIN_LENGTH}자 이상이어야 합니다.` },
      { status: 400 }
    );
  }

  const email = await verifyResetToken(token);
  if (!email) {
    return NextResponse.json(
      { error: "링크가 만료되었거나 이미 사용되었습니다. 다시 요청해 주세요." },
      { status: 400 }
    );
  }

  try {
    await prisma.user.update({
      where: { email },
      data: { password: await bcrypt.hash(password, 12) },
    });
    await consumeResetToken(token);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "비밀번호 변경에 실패했습니다." }, { status: 500 });
  }
}
