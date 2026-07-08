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

  // 여러 리드 채널(라이브·전자책·진단) 조건은 OR — 하나라도 해당되면 대상
  const channelOr: Prisma.ContactWhereInput[] = [];
  if (a.hasLiveSignup) channelOr.push({ liveSignups: { some: {} } });
  if (a.hasEbookStep1) channelOr.push({ ebookSubmissions: { some: { level: 1 } } });
  if (a.hasEbookStep2) channelOr.push({ ebookSubmissions: { some: { level: 2 } } });
  if (a.hasConsultation) channelOr.push({ consultationRequests: { some: {} } });

  const tagOr: Prisma.ContactWhereInput[] = [];
  if (a.tagsAny && a.tagsAny.length > 0) {
    tagOr.push({ tags: { hasSome: a.tagsAny } });
    tagOr.push({ user: { tags: { hasSome: a.tagsAny } } });
  }

  // channel OR 그룹과 tag OR 그룹은 서로 AND (둘 다 존재하면 두 그룹 다 만족해야).
  // 각 그룹 안에서는 OR.
  if (channelOr.length > 0 && tagOr.length > 0) {
    where.AND = [{ OR: channelOr }, { OR: tagOr }];
  } else if (channelOr.length > 0) {
    where.OR = channelOr;
  } else if (tagOr.length > 0) {
    where.OR = tagOr;
  }

  const contacts = await prisma.contact.findMany({
    where,
    select: { id: true },
  });
  return contacts.map((c) => c.id);
}
