import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Body {
  weekId?: string;
  content?: string; // 사람이 읽는 요약 (텍스트)
  formData?: unknown; // 주차별 구조화된 JSON
  imageUrls?: unknown;
  instagramUrl?: string;
}

const MAX_TEXT = 20000;
const MAX_IMAGES = 20;

/**
 * POST /api/homework/submit
 * 챌린지 참여자가 이 주차의 숙제를 제출·수정한다.
 * 같은 (weekId, userId) 조합은 upsert — 재제출 시 덮어쓰기.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const weekId = (body.weekId ?? "").toString();
  if (!weekId) return NextResponse.json({ error: "weekId 필요" }, { status: 400 });

  // 주차 조회 + 마감 여부 확인
  const week = await prisma.challengeWeek.findUnique({
    where: { id: weekId },
    include: { cohort: { select: { productSlug: true, isActive: true } } },
  });
  if (!week) return NextResponse.json({ error: "주차를 찾을 수 없어요." }, { status: 404 });
  if (!week.cohort.isActive) {
    return NextResponse.json({ error: "이 기수는 비활성화되어 있어요." }, { status: 403 });
  }

  // 참여자 게이트
  const enrolled = await prisma.purchase.findFirst({
    where: {
      userId: session.user.id,
      refundedAt: null,
      product: { slug: week.cohort.productSlug },
    },
    select: { id: true },
  });
  if (!enrolled) {
    return NextResponse.json({ error: "챌린지 참여자만 제출할 수 있어요." }, { status: 403 });
  }

  const now = new Date();
  if (week.openAt.getTime() > now.getTime()) {
    return NextResponse.json({ error: "아직 이 주차가 오픈되지 않았어요." }, { status: 400 });
  }

  const content = (body.content ?? "").toString().slice(0, MAX_TEXT);
  const instagramUrl =
    typeof body.instagramUrl === "string" && body.instagramUrl.trim()
      ? body.instagramUrl.trim().slice(0, 500)
      : null;
  const imageUrls = Array.isArray(body.imageUrls)
    ? body.imageUrls
        .filter((u): u is string => typeof u === "string" && u.startsWith("http"))
        .slice(0, MAX_IMAGES)
    : [];

  // formData는 JSON 그대로 저장 (크기 제한)
  const rawFormData = body.formData;
  const formData =
    rawFormData !== undefined ? JSON.parse(JSON.stringify(rawFormData)) : null;
  if (formData && JSON.stringify(formData).length > MAX_TEXT * 2) {
    return NextResponse.json({ error: "제출 데이터가 너무 큽니다." }, { status: 400 });
  }

  const submission = await prisma.homeworkSubmission.upsert({
    where: { weekId_userId: { weekId, userId: session.user.id } },
    create: {
      weekId,
      userId: session.user.id,
      content,
      formData,
      imageUrls,
      instagramUrl,
    },
    update: {
      content,
      formData,
      imageUrls,
      instagramUrl,
      // 재제출 시 status/feedback 은 건드리지 않음 (강사가 피드백 준 뒤 학생이 수정할 수도 있음)
    },
  });

  return NextResponse.json({ ok: true, submissionId: submission.id });
}
