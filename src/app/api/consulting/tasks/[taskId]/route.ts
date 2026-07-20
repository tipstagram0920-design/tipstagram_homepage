import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canEditTask } from "@/lib/consulting-auth";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/consulting/tasks/[taskId] — 할 일 수정/완료 토글.
 * body: { title?, description?, day?, done? }
 * DELETE /api/consulting/tasks/[taskId] — 할 일 삭제.
 * 권한: 등록 본인 또는 관리자.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  if (!userId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { taskId } = await params;
  const perm = await canEditTask(taskId, userId, isAdmin);
  if (!perm.ok) return NextResponse.json({ error: "권한이 없어요." }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title.trim().slice(0, 200);
  if (typeof body.description === "string") data.description = body.description.trim().slice(0, 2000);
  if (body.day !== undefined) {
    const day = Number(body.day);
    if (Number.isInteger(day) && day >= 1) data.day = day;
  }
  if (body.endDay !== undefined) {
    if (body.endDay === null) {
      data.endDay = null;
    } else {
      const endDay = Number(body.endDay);
      if (Number.isInteger(endDay) && endDay >= 1) data.endDay = endDay;
    }
  }
  if (body.done !== undefined) {
    data.doneAt = body.done ? new Date() : null;
  }
  if (body.data !== undefined) {
    // 도우미 입력값(JSON) 저장. 크기 제한.
    const json = JSON.parse(JSON.stringify(body.data ?? null));
    if (json && JSON.stringify(json).length > 40000) {
      return NextResponse.json({ error: "저장 데이터가 너무 커요." }, { status: 400 });
    }
    data.data = json;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "변경할 내용이 없어요." }, { status: 400 });
  }

  const task = await prisma.consultingTask.update({ where: { id: taskId }, data });
  return NextResponse.json({ ok: true, task });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  if (!userId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { taskId } = await params;
  const perm = await canEditTask(taskId, userId, isAdmin);
  if (!perm.ok) return NextResponse.json({ error: "권한이 없어요." }, { status: 403 });

  await prisma.consultingTask.delete({ where: { id: taskId } });
  return NextResponse.json({ ok: true });
}
