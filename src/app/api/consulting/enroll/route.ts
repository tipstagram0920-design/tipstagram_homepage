import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureConsultingEnrollment, getConsultingPassword } from "@/lib/consulting";

export const dynamic = "force-dynamic";

/**
 * POST /api/consulting/enroll
 * 로그인한 사용자가 공용 비밀번호를 입력해 1:1 컨설팅 프로그램에 등록.
 * 등록 즉시 startAt(=Day 1) 세팅 + 기본 21일 할 일이 개인별로 생성됨.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password.trim() : "";
  if (!password) {
    return NextResponse.json({ error: "비밀번호를 입력해 주세요." }, { status: 400 });
  }

  const expected = await getConsultingPassword();
  if (!expected) {
    return NextResponse.json(
      { error: "아직 컨설팅 프로그램이 열리지 않았어요." },
      { status: 403 }
    );
  }
  if (password !== expected) {
    return NextResponse.json({ error: "입장 비밀번호가 올바르지 않아요." }, { status: 401 });
  }

  await ensureConsultingEnrollment(session.user.id);
  return NextResponse.json({ ok: true });
}
