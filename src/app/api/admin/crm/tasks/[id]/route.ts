import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title;
  if (typeof body.detail === "string") data.detail = body.detail;
  if (body.scheduledAt) data.scheduledAt = new Date(body.scheduledAt);
  if (body.markDone === true) {
    data.status = "done";
    data.doneAt = new Date();
  }
  if (body.markSkipped === true) data.status = "skipped";
  if (body.markPending === true) {
    data.status = "pending";
    data.doneAt = null;
  }
  const task = await prisma.operatorTask.update({ where: { id }, data });
  return NextResponse.json({ task });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;
  const { id } = await params;
  await prisma.operatorTask.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
