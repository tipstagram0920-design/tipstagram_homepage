import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resetEnrollmentTasks } from "@/lib/consulting";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/consulting/[enrollmentId]/reset
 * 이 고객의 할 일을 최신 기본 템플릿으로 초기화 (관리자 전용).
 * 기존 할 일과 도우미 입력값은 삭제됩니다.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { enrollmentId } = await params;
  const exists = await prisma.consultingEnrollment.findUnique({
    where: { id: enrollmentId },
    select: { id: true },
  });
  if (!exists) return NextResponse.json({ error: "등록을 찾을 수 없어요." }, { status: 404 });

  await resetEnrollmentTasks(enrollmentId);
  return NextResponse.json({ ok: true });
}
