import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/consulting/tasks — 할 일 추가.
 * body: { day, title, description?, enrollmentId? }
 * enrollmentId 지정은 관리자만 가능 (다른 고객 일정 편집). 없으면 본인 등록 기준.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const day = Number(body.day);
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (!Number.isInteger(day) || day < 1) {
    return NextResponse.json({ error: "올바른 Day 값이 필요해요." }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "할 일 제목을 입력해 주세요." }, { status: 400 });
  }

  // 대상 enrollment 결정
  let enrollmentId: string;
  if (body.enrollmentId && isAdmin) {
    enrollmentId = String(body.enrollmentId);
    const exists = await prisma.consultingEnrollment.findUnique({
      where: { id: enrollmentId },
      select: { id: true },
    });
    if (!exists) return NextResponse.json({ error: "등록을 찾을 수 없어요." }, { status: 404 });
  } else {
    const mine = await prisma.consultingEnrollment.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!mine) return NextResponse.json({ error: "먼저 컨설팅에 등록해 주세요." }, { status: 403 });
    enrollmentId = mine.id;
  }

  const last = await prisma.consultingTask.findFirst({
    where: { enrollmentId, day },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const task = await prisma.consultingTask.create({
    data: {
      enrollmentId,
      day,
      order: (last?.order ?? -1) + 1,
      title: title.slice(0, 200),
      description: description.slice(0, 2000),
    },
  });
  return NextResponse.json({ ok: true, task });
}
