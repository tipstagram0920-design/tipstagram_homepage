import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loadGuideContext } from "@/lib/consulting-context";
import {
  generateProfileSuggestion,
  isProfileAiConfigured,
  type ProfileInput,
} from "@/lib/consulting-profile-ai";

export const dynamic = "force-dynamic";
// 모델 호출이 길어질 수 있어 여유를 둔다 (Vercel 함수 최대 실행 시간)
export const maxDuration = 120;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/**
 * POST /api/consulting/profile-suggest
 * body: { taskId, problems[], change, personaLine, personaDetail?, expertise? }
 * 컨설팅 등록자 본인(또는 관리자)만 호출 가능.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  // 본인 숙제인지 확인 (관리자는 통과)
  const taskId = str(body.taskId);
  if (!taskId) {
    return NextResponse.json({ error: "숙제 정보가 없어요." }, { status: 400 });
  }
  const task = await prisma.consultingTask.findUnique({
    where: { id: taskId },
    select: { enrollmentId: true, enrollment: { select: { userId: true } } },
  });
  if (!task || (task.enrollment.userId !== userId && !isAdmin)) {
    return NextResponse.json({ error: "권한이 없어요." }, { status: 403 });
  }

  // 이 숙제에서 본인이 직접 쓴 이야기가 1순위 재료.
  // 앞 숙제(나의 스토리·전문성)의 답은 보조로 함께 넣는다.
  const own = {
    myProblem: str(body.myProblem),
    myTurning: str(body.myTurning),
    myProof: str(body.myProof),
    whyThem: str(body.whyThem),
  };
  const { story } = await loadGuideContext(task.enrollmentId);

  const input: ProfileInput = {
    problems: Array.isArray(body.problems) ? body.problems.map(str) : [],
    change: str(body.change),
    personaLine: str(body.personaLine),
    personaDetail: str(body.personaDetail),
    expertise: str(body.expertise),
    own,
    story,
  };

  const filled = input.problems.filter(Boolean).length;
  const hasOwn = Object.values(own).some(Boolean);
  if (filled === 0 && !input.personaLine && !hasOwn) {
    return NextResponse.json(
      { error: "내 이야기나 소비자 문제를 먼저 입력해 주세요." },
      { status: 400 }
    );
  }

  if (!isProfileAiConfigured()) {
    // 키 미설정 → 클라이언트가 기존 템플릿으로 폴백한다
    return NextResponse.json({ suggestion: null, fallback: true });
  }

  const suggestion = await generateProfileSuggestion(input);
  return NextResponse.json({ suggestion, fallback: suggestion === null });
}
