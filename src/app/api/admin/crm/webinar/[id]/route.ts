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
  if (body.webinarDate) data.webinarDate = new Date(body.webinarDate);
  if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;
  if (body.zoomUrl !== undefined) data.zoomUrl = body.zoomUrl || null;
  if (body.salesUrl !== undefined) data.salesUrl = body.salesUrl || null;
  if (body.preQuestionUrl !== undefined) data.preQuestionUrl = body.preQuestionUrl || null;
  if (body.audience !== undefined) data.audience = body.audience;
  if (body.steps !== undefined) data.steps = body.steps;
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (typeof body.skipPast === "boolean") data.skipPast = body.skipPast;
  const campaign = await prisma.webinarCampaign.update({ where: { id }, data });
  return NextResponse.json({ campaign });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;
  const { id } = await params;
  await prisma.webinarCampaign.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
