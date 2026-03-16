import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const pages = await prisma.page.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(pages);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const page = await prisma.page.create({ data: { slug: body.slug, title: body.title, content: body.content, isActive: body.isActive ?? true } });
  return NextResponse.json(page);
}
