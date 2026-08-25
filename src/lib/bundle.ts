import { prisma } from "@/lib/prisma";

/**
 * 번들(끼워주는 강의) 자동 부여 규칙.
 *
 * 5주 챌린지 계열을 신청하면 "지식사업 부스터 66강 평생 이용권"(marketing-booster)을
 * 함께 지급한다 — 챌린지 랜딩에서 약속한 혜택.
 *
 * 부여 경로가 여러 곳(내부 결제 / 외부 결제 웹훅 / 관리자 수동·일괄 부여 / 기수 비밀번호 입장)이라
 * 규칙을 여기 한 곳에 모아두고 각 경로에서 grantBundle()만 부른다.
 */

/** 5주 코스 계열 상품 슬러그 */
export const CHALLENGE_PRODUCT_SLUGS = [
  "5-week-challenge",
  "5-week-challenge-plus-consulting",
] as const;

/** 5주 코스 신청자에게 함께 열어주는 상품 슬러그 */
export const CHALLENGE_BONUS_SLUGS = ["marketing-booster"] as const;

const BUNDLE_MAP: Record<string, readonly string[]> = Object.fromEntries(
  CHALLENGE_PRODUCT_SLUGS.map((slug) => [slug, CHALLENGE_BONUS_SLUGS])
);

export interface GrantResult {
  /** 이번에 새로 부여한 슬러그 */
  granted: string[];
  /** 이미 갖고 있어 건너뛴 슬러그 */
  skipped: string[];
}

/**
 * 지정한 상품들을 사용자에게 0원 수강권으로 부여한다. 멱등(이미 있으면 건너뜀).
 * 환불 처리된 이력만 있으면 되살린다.
 */
export async function grantProducts(
  userId: string,
  slugs: readonly string[],
  orderIdPrefix: string
): Promise<GrantResult> {
  const granted: string[] = [];
  const skipped: string[] = [];

  for (const slug of slugs) {
    try {
      const product = await prisma.product.findUnique({ where: { slug } });
      if (!product) continue;

      const existing = await prisma.purchase.findFirst({
        where: { userId, productId: product.id },
        orderBy: { createdAt: "desc" },
      });

      // 유효한 수강권이 이미 있으면 그대로 둔다
      if (existing && !existing.refundedAt) {
        skipped.push(slug);
        continue;
      }

      // 취소된 이력이 있으면 새 행 대신 되살린다 (이력 중복 방지)
      if (existing) {
        await prisma.purchase.update({
          where: { id: existing.id },
          data: { refundedAt: null, refundReason: null, refundedBy: null },
        });
        granted.push(slug);
        continue;
      }

      await prisma.purchase.create({
        data: {
          userId,
          productId: product.id,
          amount: 0,
          orderId: `${orderIdPrefix}-bonus-${slug}`,
        },
      });
      granted.push(slug);
    } catch (e) {
      // 번들 부여 실패가 본 결제/등록을 막지 않도록 삼킨다
      console.error("[bundle] 부여 실패:", slug, e);
    }
  }

  return { granted, skipped };
}

/**
 * 상품 구매에 딸린 번들을 부여한다.
 * productSlug가 번들 대상이 아니면 아무것도 하지 않는다.
 */
export async function grantBundleForProduct(
  userId: string,
  productSlug: string,
  orderId: string
): Promise<GrantResult> {
  const bonus = BUNDLE_MAP[productSlug];
  if (!bonus?.length) return { granted: [], skipped: [] };
  return grantProducts(userId, bonus, orderId);
}

/** productId만 알고 있을 때 쓰는 래퍼. */
export async function grantBundleForProductId(
  userId: string,
  productId: string,
  orderId: string
): Promise<GrantResult> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });
  if (!product) return { granted: [], skipped: [] };
  return grantBundleForProduct(userId, product.slug, orderId);
}

/**
 * 5주 챌린지 기수에 등록(비밀번호 입장 포함)한 사용자에게 부스터를 부여한다.
 * 결제 없이 입장한 사람도 랜딩에서 약속한 혜택을 동일하게 받게 하기 위함.
 */
export async function grantChallengeBonus(
  userId: string,
  cohortId: string
): Promise<GrantResult> {
  return grantProducts(userId, CHALLENGE_BONUS_SLUGS, `challenge-${cohortId}-${userId}`);
}
