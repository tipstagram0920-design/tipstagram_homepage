import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncEnrollmentTasks } from "@/lib/consulting";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/consulting/[enrollmentId]/sync
 * 템플릿에는 있는데 이 고객에게 없는 숙제만 추가한다 (관리자 전용).
 * 기존 할 일과 작성한 답은 그대로 둔다 — 진행 중인 고객에게 안전하다.
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

  const { added } = await syncEnrollmentTasks(enrollmentId);
  return NextResponse.json({ ok: true, added });
}
