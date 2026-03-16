import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "ADMIN") return false;
  return true;
}

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const blocks = await prisma.homepageBlock.findMany({ orderBy: [{ section: "asc" }, { order: "asc" }] });
  return NextResponse.json(blocks);
}

export async function POST(req: Request) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { section, data, isActive } = body;
  const last = await prisma.homepageBlock.findFirst({ where: { section }, orderBy: { order: "desc" } });
  const block = await prisma.homepageBlock.create({
    data: { section, data: JSON.stringify(data), isActive: isActive ?? true, order: (last?.order ?? -1) + 1 },
  });
  return NextResponse.json(block);
}
