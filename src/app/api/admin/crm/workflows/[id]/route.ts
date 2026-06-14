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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.trigger === "string") data.trigger = body.trigger;
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (body.conditions !== undefined) data.conditions = body.conditions;
  if (body.steps !== undefined) data.steps = body.steps;

  const workflow = await prisma.workflow.update({ where: { id }, data });
  return NextResponse.json({ workflow });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;
  const { id } = await params;
  await prisma.workflow.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
