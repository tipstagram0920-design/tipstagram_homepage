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
  { params }: { params: Promise<{ cohortId: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;
  const { cohortId } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.productSlug === "string") data.productSlug = body.productSlug.trim();
  if (typeof body.weeksTotal === "number") data.weeksTotal = Math.max(1, Math.min(12, body.weeksTotal));
  if (body.week1StartAt) data.week1StartAt = new Date(body.week1StartAt);
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  const cohort = await prisma.challengeCohort.update({ where: { id: cohortId }, data });
  return NextResponse.json({ cohort });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ cohortId: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;
  const { cohortId } = await params;
  await prisma.challengeCohort.delete({ where: { id: cohortId } });
  return NextResponse.json({ ok: true });
}
