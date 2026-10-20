import { NextRequest, NextResponse } from "next/server";
import { createCohortWithWeeks } from "@/lib/challenge-cohort";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

/**
 * POST /api/admin/challenge — 신규 기수 생성 + 주차 자동 시드.
 * body: { name, productSlug, week1StartAt(ISO), weeksTotal, isActive }
 * 각 주차는 week1StartAt + (weekIndex-1)*7일에 openAt, +6일 21:00에 homeworkDueAt.
 */
export async function POST(req: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;
  const body = await req.json();
  const name = (body.name ?? "").trim();
  const productSlug = (body.productSlug ?? "").trim();
  const weeksTotal = Math.max(1, Math.min(12, parseInt(body.weeksTotal) || 5));
  const week1StartIso = body.week1StartAt;
  if (!name) return NextResponse.json({ error: "이름 필요" }, { status: 400 });
  if (!productSlug) return NextResponse.json({ error: "productSlug 필요" }, { status: 400 });
  if (!week1StartIso) return NextResponse.json({ error: "week1StartAt 필요" }, { status: 400 });

  const week1 = new Date(week1StartIso);
  if (isNaN(week1.getTime())) return NextResponse.json({ error: "잘못된 날짜" }, { status: 400 });

  const openChatUrl =
    typeof body.openChatUrl === "string" && body.openChatUrl.trim() ? body.openChatUrl.trim() : null;
  const accessPassword =
    typeof body.accessPassword === "string" && body.accessPassword.trim()
      ? body.accessPassword.trim()
      : null;

  const cohort = await createCohortWithWeeks({
    name,
    productSlug,
    weeksTotal,
    week1StartAt: week1,
    isActive: !!body.isActive,
    accessPassword,
    openChatUrl,
  });

  return NextResponse.json({ cohort });
}
