import { prisma } from "@/lib/prisma";

const CHALLENGE_SLUGS = ["5-week-challenge", "5-week-challenge-plus-consulting"];

/**
 * 이 사용자가 이 기수에 참여할 자격이 있는지 (챌린지 계열 상품을 유효 구매)
 * 리턴: 자격 있으면 Purchase 최소 정보, 없으면 null.
 */
export async function assertCohortEnrollment(
  userId: string,
  cohortId: string
): Promise<{ cohort: { id: string; productSlug: string; name: string; week1StartAt: Date; weeksTotal: number; isActive: boolean } } | null> {
  const cohort = await prisma.challengeCohort.findUnique({
    where: { id: cohortId },
    select: {
      id: true,
      productSlug: true,
      name: true,
      week1StartAt: true,
      weeksTotal: true,
      isActive: true,
    },
  });
  if (!cohort) return null;
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId,
      refundedAt: null,
      product: { slug: cohort.productSlug },
    },
    select: { id: true },
  });
  if (!purchase) return null;
  return { cohort };
}

/**
 * 이 사용자가 참여 자격이 있는 활성 챌린지 기수를 (가장 최근 것부터) 반환.
 * classroom에서 "5주 챌린지 대시보드 열기" 카드 노출용.
 */
export async function findEnrolledCohortsForUser(userId: string) {
  const purchases = await prisma.purchase.findMany({
    where: {
      userId,
      refundedAt: null,
      product: { slug: { in: CHALLENGE_SLUGS } },
    },
    select: { product: { select: { slug: true } } },
  });
  const slugs = Array.from(new Set(purchases.map((p) => p.product.slug)));
  if (slugs.length === 0) return [];
  return prisma.challengeCohort.findMany({
    where: { productSlug: { in: slugs }, isActive: true },
    orderBy: { week1StartAt: "desc" },
    select: { id: true, name: true, week1StartAt: true, weeksTotal: true, productSlug: true },
  });
}
