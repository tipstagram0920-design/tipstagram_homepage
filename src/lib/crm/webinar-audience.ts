import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface AudienceCriteria {
  /** 모든 조건 충족 */
  source?: string[];
  tagsAny?: string[];
  hasUser?: boolean;
  hasLiveSignup?: boolean;
  hasEbookStep1?: boolean;
  hasEbookStep2?: boolean;
  /** 진단 세션 신청자 여부 */
  hasConsultation?: boolean;
  /** unsubscribe 무시 (거래성). 기본 false */
  includeUnsubscribed?: boolean;
}

/**
 * audience 조건에 매칭되는 Contact id 배열 반환.
 * 조건 없으면 전체 컨택트(unsubscribe 제외).
 */
export async function resolveAudience(a: AudienceCriteria): Promise<string[]> {
  const where: Prisma.ContactWhereInput = {};

  if (!a.includeUnsubscribed) {
    where.unsubscribedAt = null;
    where.consentEmail = true;
  }

  if (a.source && a.source.length > 0) {
    where.source = { in: a.source };
  }

  if (a.hasUser === true) where.user = { isNot: null };
  if (a.hasUser === false) where.user = null;

  if (a.hasLiveSignup) where.liveSignups = { some: {} };
  if (a.hasEbookStep1) where.ebookSubmissions = { some: { level: 1 } };
  if (a.hasEbookStep2) where.ebookSubmissions = { some: { level: 2 } };
  if (a.hasConsultation) where.consultationRequests = { some: {} };

  if (a.tagsAny && a.tagsAny.length > 0) {
    // hasUser=false 인 경우 무시 (회원 아닌 컨택트는 태그가 없음)
    const userFilter =
      typeof where.user === "object" && where.user !== null
        ? (where.user as Prisma.UserWhereInput)
        : ({} as Prisma.UserWhereInput);
    where.user = { ...userFilter, tags: { hasSome: a.tagsAny } };
  }

  const contacts = await prisma.contact.findMany({
    where,
    select: { id: true },
  });
  return contacts.map((c) => c.id);
}
