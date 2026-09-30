import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loadGuideContext } from "@/lib/consulting-context";
import {
  generatePageCopy,
  isPageAiConfigured,
  type PageKind,
} from "@/lib/consulting-page-ai";

export const dynamic = "force-dynamic";
// 모델 호출이 길어질 수 있어 여유를 둔다 (Vercel 함수 최대 실행 시간)
export const maxDuration = 120;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

const KINDS: PageKind[] = ["freebie", "trial", "event", "proof", "faq"];

/**
 * POST /api/consulting/page-generate
 * body: { taskId, kind, answers: [{ label, value }] }
 * 무료자료·후기·FAQ 페이지 숙제가 공통으로 쓴다.
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

  const kind = str(body.kind) as PageKind;
  if (!KINDS.includes(kind)) {
    return NextResponse.json({ error: "어떤 페이지인지 알 수 없어요." }, { status: 400 });
  }

  const answers = (Array.isArray(body.answers) ? body.answers : [])
    .map((a: unknown) => ({
      label: str((a as { label?: unknown })?.label),
      value: str((a as { value?: unknown })?.value),
    }))
    .filter((a: { label: string }) => a.label);

  if (!answers.some((a: { value: string }) => a.value)) {
    return NextResponse.json(
      { error: "항목을 하나라도 채운 뒤에 눌러주세요." },
      { status: 400 }
    );
  }

  const context = await loadGuideContext(task.enrollmentId);

  if (!isPageAiConfigured()) {
    // 키 미설정 → 클라이언트가 입력값 조립 폴백으로 보여준다
    return NextResponse.json({ copy: null, fallback: true });
  }

  const copy = await generatePageCopy({ kind, answers, context });
  return NextResponse.json({ copy, fallback: copy === null });
}
