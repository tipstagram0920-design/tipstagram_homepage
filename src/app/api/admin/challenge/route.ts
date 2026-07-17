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

  const accessPassword =
    typeof body.accessPassword === "string" && body.accessPassword.trim()
      ? body.accessPassword.trim()
      : null;

  const cohort = await prisma.challengeCohort.create({
    data: {
      name,
      productSlug,
      weeksTotal,
      week1StartAt: week1,
      isActive: !!body.isActive,
      accessPassword,
      weeks: {
        create: Array.from({ length: weeksTotal }, (_, i) => {
          const openAt = new Date(week1.getTime() + i * 7 * 24 * 60 * 60 * 1000);
          // 마감: 오픈 후 6일 뒤 21:00 KST (오픈시각의 6일 후 같은 시각 → 조정 없이 그대로)
          // 마감 시각은 KST 21:00으로 강제하지 않고 오픈+6일 로 두고 어드민이 편집.
          const homeworkDueAt = new Date(openAt.getTime() + 6 * 24 * 60 * 60 * 1000);
          return {
            weekIndex: i + 1,
            title: `Week ${i + 1}`,
            openAt,
            homeworkDueAt,
          };
        }),
      },
    },
    include: { weeks: true },
  });

  return NextResponse.json({ cohort });
}
