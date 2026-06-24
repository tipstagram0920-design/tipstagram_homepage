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
  // URL-safe: 영문·숫자·하이픈만 허용. 한글이 포함된 제목은 유효 문자가 비어
  // 자동으로 fallback(timestamp) slug가 생성됨 — production 동적 라우트의
  // 한글 매칭 이슈 회피.
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function fallbackSlug() {
  return `f-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
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
  let slug = (body.slug ? slugify(body.slug) : slugify(body.title)).trim();
  if (!slug) slug = fallbackSlug();
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
