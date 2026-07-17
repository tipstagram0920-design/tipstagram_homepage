import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/challenge/[cohortId]/enroll
 * 로그인한 사용자가 공용 입장 비밀번호를 입력해 챌린지 기수에 참여자로 등록.
 * body: { password }
 * - 비번 일치 시 ChallengeEnrollment upsert → 다음부터는 로그인만으로 입장.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ cohortId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { cohortId } = await params;
  const body = await req.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password.trim() : "";
  if (!password) {
    return NextResponse.json({ error: "비밀번호를 입력해 주세요." }, { status: 400 });
  }

  const cohort = await prisma.challengeCohort.findUnique({
    where: { id: cohortId },
    select: { id: true, accessPassword: true },
  });
  if (!cohort) {
    return NextResponse.json({ error: "존재하지 않는 기수입니다." }, { status: 404 });
  }
  if (!cohort.accessPassword) {
    return NextResponse.json(
      { error: "이 기수는 비밀번호 입장을 사용하지 않아요." },
      { status: 403 }
    );
  }
  if (password !== cohort.accessPassword) {
    return NextResponse.json(
      { error: "입장 비밀번호가 올바르지 않아요." },
      { status: 401 }
    );
  }

  await prisma.challengeEnrollment.upsert({
    where: { cohortId_userId: { cohortId, userId: session.user.id } },
    update: {},
    create: { cohortId, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
