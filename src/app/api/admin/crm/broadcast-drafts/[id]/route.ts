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
  if (typeof body.body === "string") data.body = body.body;
  if (typeof body.channel === "string") data.channel = body.channel;
  if (body.scheduledAt) data.scheduledAt = new Date(body.scheduledAt);
  if (typeof body.notes === "string") data.notes = body.notes;
  if (body.markDone === true) {
    data.status = "done";
    data.doneAt = new Date();
  }
  if (typeof body.status === "string") data.status = body.status;

  const draft = await prisma.broadcastDraft.update({ where: { id }, data });
  return NextResponse.json({ draft });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;
  const { id } = await params;
  await prisma.broadcastDraft.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
