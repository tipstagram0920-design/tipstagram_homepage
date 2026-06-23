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

function slugify(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function GET() {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;
  const freebies = await prisma.freebie.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { submissions: true } } },
  });
  return NextResponse.json({ freebies });
}

export async function POST(req: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;
  const body = await req.json();
  if (!body.title) {
    return NextResponse.json({ error: "title 필요" }, { status: 400 });
  }
  let slug = (body.slug || slugify(body.title)).trim();
  // 중복 회피
  const exists = await prisma.freebie.findUnique({ where: { slug } });
  if (exists) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const freebie = await prisma.freebie.create({
    data: {
      slug,
      title: body.title,
      subtitle: body.subtitle ?? null,
      description: body.description ?? null,
      fileUrl: body.fileUrl ?? null,
      thumbnail: body.thumbnail ?? null,
      category: body.category ?? null,
      customEmailBody: body.customEmailBody ?? null,
      showLivePromo: body.showLivePromo !== false,
      isActive: body.isActive !== false,
    },
  });
  return NextResponse.json({ freebie });
}
