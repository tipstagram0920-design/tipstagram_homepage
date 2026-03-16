import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const templates = await prisma.emailTemplate.findMany({
    orderBy: { createdAt: "asc" },
    include: { product: { select: { id: true, title: true } } },
  });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { type, productId, name, subject, html, isActive } = await req.json();
  if (!type || !name || !subject || !html) {
    return NextResponse.json({ error: "필수 항목을 입력하세요." }, { status: 400 });
  }

  const resolvedProductId = productId || null;

  const template = await prisma.emailTemplate.upsert({
    where: { type_productId: { type, productId: resolvedProductId } },
    update: { name, subject, html, isActive: isActive ?? true },
    create: { type, productId: resolvedProductId, name, subject, html, isActive: isActive ?? true },
    include: { product: { select: { id: true, title: true } } },
  });
  return NextResponse.json(template);
}
