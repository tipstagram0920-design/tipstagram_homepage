import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loadGuideContext } from "@/lib/consulting-context";
import {
  generateLandingCopy,
  isLandingAiConfigured,
} from "@/lib/consulting-landing-ai";
import type { LandingKey, LandingPageData } from "@/lib/consulting-guide-data";

export const dynamic = "force-dynamic";
// 모델 호출이 길어질 수 있어 여유를 둔다 (Vercel 함수 최대 실행 시간)
export const maxDuration = 120;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

const KEYS: LandingKey[] = [
  "problem",
  "loss",
  "myStory",
  "solution",
  "product",
  "reviews",
  "composition",
  "faq",
  "bonusNow",
  "addedValue",
  "cta",
];

/**
 * POST /api/consulting/landing-generate
 * body: { taskId, fields: { problem, loss, ... } }
 * 컨설팅 등록자 본인(또는 관리자)만 호출 가능.
 * 앞 숙제(나의 스토리 · 소비자 선정/확정 프로필)를 서버에서 읽어 함께 넣는다.
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

  const raw = (body.fields ?? {}) as Record<string, unknown>;
  const fields: LandingPageData = {};
  for (const k of KEYS) fields[k] = str(raw[k]);

  const context = await loadGuideContext(task.enrollmentId);

  const filled = KEYS.filter((k) => fields[k]).length;
  if (filled === 0) {
    return NextResponse.json(
      { error: "항목을 하나라도 채운 뒤에 눌러주세요." },
      { status: 400 }
    );
  }

  if (!isLandingAiConfigured()) {
    // 키 미설정 → 클라이언트가 기존 조립 템플릿으로 폴백한다
    return NextResponse.json({ copy: null, fallback: true });
  }

  const copy = await generateLandingCopy({ fields, context });
  return NextResponse.json({ copy, fallback: copy === null });
}
