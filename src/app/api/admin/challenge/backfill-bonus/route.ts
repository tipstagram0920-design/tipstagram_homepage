import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  CHALLENGE_BONUS_SLUGS,
  CHALLENGE_PRODUCT_SLUGS,
  grantProducts,
} from "@/lib/bundle";

export const dynamic = "force-dynamic";

/**
 * 5주 코스 기존 신청자 소급 부여.
 *
 * 대상 = (기수에 등록된 사람) ∪ (5주 코스 계열 상품을 환불 없이 보유한 사람)
 * 이들에게 마케팅 부스터 66강을 부여한다. 이미 갖고 있으면 건너뛴다(멱등).
 *
 * GET  → 대상만 집계해서 미리보기 (변경 없음)
 * POST → 실제 부여
 */

async function collectTargets() {
  const [enrollments, purchases] = await Promise.all([
    prisma.challengeEnrollment.findMany({ select: { userId: true } }),
    prisma.purchase.findMany({
      where: {
        refundedAt: null,
        product: { slug: { in: [...CHALLENGE_PRODUCT_SLUGS] } },
      },
      select: { userId: true },
    }),
  ]);

  return [...new Set([...enrollments, ...purchases].map((r) => r.userId))];
}

async function requireAdmin() {
  const session = await auth();
  return (session?.user as { role?: string })?.role === "ADMIN";
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const userIds = await collectTargets();
  const bonusProducts = await prisma.product.findMany({
    where: { slug: { in: [...CHALLENGE_BONUS_SLUGS] } },
    select: { id: true },
  });

  const alreadyHave = await prisma.purchase.findMany({
    where: {
      userId: { in: userIds },
      productId: { in: bonusProducts.map((p) => p.id) },
      refundedAt: null,
    },
    select: { userId: true },
  });
  const haveSet = new Set(alreadyHave.map((p) => p.userId));

  return NextResponse.json({
    total: userIds.length,
    alreadyHave: haveSet.size,
    willGrant: userIds.filter((id) => !haveSet.has(id)).length,
  });
}

export async function POST(_req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const userIds = await collectTargets();

  let granted = 0;
  let skipped = 0;
  for (const userId of userIds) {
    const result = await grantProducts(
      userId,
      CHALLENGE_BONUS_SLUGS,
      `backfill-${userId}`
    );
    if (result.granted.length) granted += 1;
    else skipped += 1;
  }

  return NextResponse.json({ ok: true, total: userIds.length, granted, skipped });
}
