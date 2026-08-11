import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "crypto";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 헷갈리는 글자(0/O, 1/l/I) 제외
const CHARSET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const TEMP_LENGTH = 10;
const MIN_LENGTH = 8;

function generateTempPassword() {
  let out = "";
  for (let i = 0; i < TEMP_LENGTH; i++) {
    out += CHARSET[randomInt(CHARSET.length)];
  }
  return out;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;

  let body: { password?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const custom = typeof body.password === "string" ? body.password.trim() : "";
  if (custom && custom.length < MIN_LENGTH) {
    return NextResponse.json(
      { error: `비밀번호는 ${MIN_LENGTH}자 이상이어야 합니다.` },
      { status: 400 }
    );
  }

  const newPassword = custom || generateTempPassword();

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { password: await bcrypt.hash(newPassword, 10) },
      select: { id: true, name: true, email: true },
    });

    // 평문 비밀번호는 응답으로만 1회 전달하고 저장/로그에 남기지 않는다.
    return NextResponse.json({
      ok: true,
      password: newPassword,
      generated: !custom,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch {
    return NextResponse.json({ error: "비밀번호 재설정에 실패했습니다." }, { status: 500 });
  }
}
