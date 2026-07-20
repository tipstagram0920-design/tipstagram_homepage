import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/consulting/tasks/reorder
 * 드래그&드롭 결과를 일괄 저장. day/order 를 여러 task에 한 번에 반영.
 * body: { moves: [{ id, day, order }] }
 * 권한: 대상 task들이 모두 본인 등록이거나, 관리자.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  if (!userId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const moves = Array.isArray(body.moves) ? body.moves : [];
  if (moves.length === 0) {
    return NextResponse.json({ error: "변경 내용이 없어요." }, { status: 400 });
  }

  const clean = moves
    .map((m: unknown) => {
      if (!m || typeof m !== "object") return null;
      const r = m as Record<string, unknown>;
      const id = typeof r.id === "string" ? r.id : null;
      const day = Number(r.day);
      const order = Number(r.order);
      if (!id || !Number.isInteger(day) || day < 1 || !Number.isInteger(order)) return null;
      return { id, day, order };
    })
    .filter(Boolean) as { id: string; day: number; order: number }[];

  if (clean.length === 0) {
    return NextResponse.json({ error: "올바르지 않은 요청이에요." }, { status: 400 });
  }

  // 대상 task들의 소유권 확인
  const ids = clean.map((m) => m.id);
  const tasks = await prisma.consultingTask.findMany({
    where: { id: { in: ids } },
    select: { id: true, enrollment: { select: { userId: true } } },
  });
  if (tasks.length !== ids.length) {
    return NextResponse.json({ error: "일부 할 일을 찾을 수 없어요." }, { status: 404 });
  }
  const notAllowed = tasks.some((t) => !isAdmin && t.enrollment.userId !== userId);
  if (notAllowed) {
    return NextResponse.json({ error: "권한이 없어요." }, { status: 403 });
  }

  await prisma.$transaction(
    clean.map((m) =>
      prisma.consultingTask.update({
        where: { id: m.id },
        data: { day: m.day, order: m.order },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
