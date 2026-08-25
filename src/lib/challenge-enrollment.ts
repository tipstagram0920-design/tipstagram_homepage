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
  if (purchase) return { cohort };
  // 상위 상품(챌린지+컨설팅) 구매자도 같은 기수에 들어온다.
  // 기수는 productSlug 를 "5-week-challenge" 하나로만 만들어 왔는데, 그대로 두면
  // 330만원 상품 구매자가 자기 기수에 접근하지 못한다.
  if (CHALLENGE_SLUGS.includes(cohort.productSlug)) {
    const sibling = await prisma.purchase.findFirst({
      where: { userId, refundedAt: null, product: { slug: { in: CHALLENGE_SLUGS } } },
      select: { id: true },
    });
    if (sibling) return { cohort };
  }
  // 구매 기록이 없어도 공용 비밀번호로 등록한 참여자면 접근 허용
  const enrollment = await prisma.challengeEnrollment.findUnique({
    where: { cohortId_userId: { cohortId, userId } },
    select: { id: true },
  });
  if (enrollment) return { cohort };
  return null;
}

/**
 * 이 사용자가 참여 자격이 있는 활성 챌린지 기수를 (가장 최근 것부터) 반환.
 * classroom에서 "5주 챌린지 대시보드 열기" 카드 노출용.
 */
export async function findEnrolledCohortsForUser(userId: string) {
  const [purchases, enrollments] = await Promise.all([
    prisma.purchase.findMany({
      where: {
        userId,
        refundedAt: null,
        product: { slug: { in: CHALLENGE_SLUGS } },
      },
      select: { product: { select: { slug: true } } },
    }),
    // 공용 비밀번호로 등록한 기수도 카드에 노출
    prisma.challengeEnrollment.findMany({
      where: { userId },
      select: { cohortId: true },
    }),
  ]);
  // 챌린지 계열을 하나라도 샀으면 챌린지 기수 전체가 대상이다 (기수는 대표 slug 하나로만 만든다)
  const slugs = purchases.length > 0 ? CHALLENGE_SLUGS : [];
  const enrolledCohortIds = enrollments.map((e) => e.cohortId);
  if (slugs.length === 0 && enrolledCohortIds.length === 0) return [];
  return prisma.challengeCohort.findMany({
    where: {
      isActive: true,
      OR: [
        { productSlug: { in: slugs } },
        { id: { in: enrolledCohortIds } },
      ],
    },
    orderBy: { week1StartAt: "desc" },
    select: { id: true, name: true, week1StartAt: true, weeksTotal: true, productSlug: true, openChatUrl: true },
  });
}


/**
 * 이 사용자를 안내할 챌린지 기수 하나.
 *
 * 결제 직후 "어느 기수의 오픈채팅방을 보여줄지" 를 정하는 규칙이다:
 * **아직 시작하지 않은 활성 기수 중 가장 이른 것.** 없으면 가장 최근에 시작한 기수.
 * (새 기수를 만들어 두면 그때부터 새로 산 사람은 자동으로 그 기수로 간다)
 */
export async function findCohortForNewPurchase(userId: string): Promise<{ id: string } | null> {
  const owns = await prisma.purchase.findFirst({
    where: { userId, refundedAt: null, product: { slug: { in: CHALLENGE_SLUGS } } },
    select: { id: true },
  });
  if (!owns) return null;

  const now = new Date();
  const upcoming = await prisma.challengeCohort.findFirst({
    where: { isActive: true, productSlug: { in: CHALLENGE_SLUGS }, week1StartAt: { gte: now } },
    orderBy: { week1StartAt: "asc" },
    select: { id: true },
  });
  if (upcoming) return upcoming;

  return prisma.challengeCohort.findFirst({
    where: { isActive: true, productSlug: { in: CHALLENGE_SLUGS } },
    orderBy: { week1StartAt: "desc" },
    select: { id: true },
  });
}
