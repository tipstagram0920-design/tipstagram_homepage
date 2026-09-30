import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  assertCohortEnrollment,
  saveOnboarding,
} from "@/lib/challenge-enrollment";
import { isOnboardingComplete, parseOnboarding } from "@/lib/challenge-onboarding";

export const dynamic = "force-dynamic";

/**
 * POST /api/challenge/[cohortId]/onboarding
 * 시작 전 방향 선택 저장.
 * body: { hasProduct, track, productNote?, stage, goal }
 * 이 기수에 참여 자격이 있는 사람만 저장할 수 있다.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ cohortId: string }> }
) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { cohortId } = await params;
  const access = await assertCohortEnrollment(userId, cohortId);
  if (!access) {
    return NextResponse.json({ error: "이 기수에 참여 중이 아니에요." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  // 클라이언트 값은 믿지 않는다. 허용된 선택지 id 인지 서버에서 다시 확인한다.
  const answers = parseOnboarding(body);
  if (!isOnboardingComplete(answers)) {
    return NextResponse.json(
      { error: "선택이 덜 끝났어요. 처음부터 다시 골라주세요." },
      { status: 400 }
    );
  }

  await saveOnboarding(userId, cohortId, answers);
  return NextResponse.json({ ok: true });
}
