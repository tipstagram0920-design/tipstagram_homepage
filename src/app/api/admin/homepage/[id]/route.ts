import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "ADMIN") return false;
  return true;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const block = await prisma.homepageBlock.update({
    where: { id },
    data: { data: JSON.stringify(body.data), isActive: body.isActive },
  });
  return NextResponse.json(block);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.homepageBlock.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
