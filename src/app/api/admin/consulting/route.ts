import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setSetting } from "@/lib/settings";
import {
  CONSULTING_PASSWORD_KEY,
  ensureConsultingEnrollment,
} from "@/lib/consulting";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/consulting — 관리자가 1:1 컨설팅 고객을 직접 등록.
 * 등록 즉시 3주(21일) 할 일이 생성되고, 첫 번째 할 일에 intakeNote가 들어간다.
 * body: { email, intakeNote?, startAt? }
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const intakeNote = typeof body.intakeNote === "string" ? body.intakeNote.trim() : "";
  if (!email) {
    return NextResponse.json({ error: "고객 이메일을 입력해 주세요." }, { status: 400 });
  }

  let startAt: Date | undefined;
  if (typeof body.startAt === "string" && body.startAt.trim()) {
    const d = new Date(body.startAt);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: "시작일 형식이 올바르지 않아요." }, { status: 400 });
    }
    startAt = d;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });
  if (!user) {
    return NextResponse.json(
      { error: "그 이메일로 가입한 회원이 없어요. 고객이 먼저 회원가입을 해야 합니다." },
      { status: 404 }
    );
  }

  const already = await prisma.consultingEnrollment.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (already) {
    return NextResponse.json(
      { error: "이미 등록된 고객이에요.", enrollmentId: already.id },
      { status: 409 }
    );
  }

  const enrollment = await ensureConsultingEnrollment(user.id, { intakeNote, startAt });
  return NextResponse.json({ ok: true, enrollmentId: enrollment.id });
}

/**
 * PUT /api/admin/consulting — 컨설팅 공용 입장 비밀번호 설정.
 * body: { accessPassword }
 */
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const pw = typeof body.accessPassword === "string" ? body.accessPassword.trim() : "";
  await setSetting(CONSULTING_PASSWORD_KEY, pw);
  return NextResponse.json({ ok: true });
}
