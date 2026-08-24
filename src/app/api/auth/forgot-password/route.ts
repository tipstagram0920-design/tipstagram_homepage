import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ResendEmailChannel } from "@/lib/messaging/email";
import { buildResetEmail, createResetToken, normalizeEmail } from "@/lib/password-reset";

// 계정 존재 여부가 새어나가지 않도록 항상 같은 응답을 준다.
const OK = { ok: true } as const;

export async function POST(req: NextRequest) {
  let email = "";
  try {
    const body = await req.json();
    email = normalizeEmail(body?.email ?? "");
  } catch {
    return NextResponse.json(OK);
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(OK);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    // 가입되지 않은 이메일이어도 동일한 성공 응답 (이메일 존재 여부 노출 방지)
    if (!user) return NextResponse.json(OK);

    const rawToken = await createResetToken(user.email);
    const mail = buildResetEmail(rawToken, user.name);

    // MessageLog에 재설정 링크가 남지 않도록 채널을 직접 호출한다.
    await new ResendEmailChannel().send({
      to: user.email,
      subject: mail.subject,
      body: mail.html,
      transactional: true,
    });
  } catch {
    // 실패해도 동일 응답 (원인 노출 방지)
  }

  return NextResponse.json(OK);
}
