import { prisma } from "@/lib/prisma";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { CHALLENGE_SLUGS } from "@/lib/challenge-enrollment";

/** 100만원 단일 상품 — 수익화 프로그램(스튜디오 설치권 + 부스터 강의) */
export const MONETIZATION_SLUG = "monetization-program";

/** 스튜디오(설치 파일)를 받을 수 있는 상품 슬러그 기본값: 새 상품 + 5주 챌린지 계열(기존 수강생) */
export const STUDIO_DEFAULT_SLUGS: readonly string[] = [MONETIZATION_SLUG, ...CHALLENGE_SLUGS];

/** 관리자 설정(studio_product_slugs, 쉼표 구분)이 있으면 그걸, 없으면 기본값 */
export async function getStudioSlugs(): Promise<string[]> {
  const raw = (await getSetting(SETTING_KEYS.studioProductSlugs)) || "";
  const list = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return list.length ? list : [...STUDIO_DEFAULT_SLUGS];
}

/** 유효 구매(환불 안 됨) 또는 챌린지 기수 등록이 있으면 스튜디오 접근 가능 */
export async function hasStudioAccess(userId: string): Promise<boolean> {
  const slugs = await getStudioSlugs();
  const [purchase, enrollment] = await Promise.all([
    prisma.purchase.findFirst({ where: { userId, refundedAt: null, product: { slug: { in: slugs } } }, select: { id: true } }),
    prisma.challengeEnrollment.findFirst({ where: { userId }, select: { id: true } }),
  ]);
  return Boolean(purchase || enrollment);
}

/** 설치 파일 (public/studio/ 에 정적으로 둔다. pack.mjs 가 갱신) */
export const STUDIO_FILES = {
  mac: "/studio/팁스타그램-스튜디오-설치.command",
  windows: "/studio/팁스타그램-스튜디오-설치.bat",
  zip: "/studio/tipstagram-studio.zip",
} as const;

export function detectOs(userAgent: string): "mac" | "windows" | "other" {
  const ua = userAgent.toLowerCase();
  if (/windows/.test(ua)) return "windows";
  if (/macintosh|mac os x/.test(ua) && !/iphone|ipad/.test(ua)) return "mac";
  return "other";
}
