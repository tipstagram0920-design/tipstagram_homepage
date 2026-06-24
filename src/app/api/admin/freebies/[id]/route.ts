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
  if (typeof body.title === "string") data.title = body.title;
  if (typeof body.slug === "string") {
    const normalized = body.slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
    if (!normalized) {
      return NextResponse.json(
        { error: "slug는 영문/숫자/하이픈만 가능합니다." },
        { status: 400 }
      );
    }
    data.slug = normalized;
  }
  if (body.subtitle !== undefined) data.subtitle = body.subtitle;
  if (body.description !== undefined) data.description = body.description;
  if (body.fileUrl !== undefined) data.fileUrl = body.fileUrl;
  if (body.thumbnail !== undefined) data.thumbnail = body.thumbnail;
  if (body.category !== undefined) data.category = body.category;
  if (body.customEmailBody !== undefined) data.customEmailBody = body.customEmailBody;
  if (typeof body.showLivePromo === "boolean") data.showLivePromo = body.showLivePromo;
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  const freebie = await prisma.freebie.update({ where: { id }, data });
  return NextResponse.json({ freebie });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;
  const { id } = await params;
  await prisma.freebie.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
