import { prisma } from "@/lib/prisma";
import { defaultLiveAt, defaultHomeworkDueAt } from "@/lib/challenge-schedule";

/**
 * 기수 + 주차 생성 — 어드민 기수 생성과 라이브 관제탑이 같은 함수를 쓴다.
 * 주차 생성 규칙(7일 간격·라이브 20시·마감 +6일 21시)이 두 군데로 갈라지면 한쪽만 고쳐지는 사고가 난다.
 */
export async function createCohortWithWeeks(input: {
  name: string;
  productSlug: string;
  week1StartAt: Date;
  weeksTotal?: number;
  isActive?: boolean;
  accessPassword?: string | null;
  openChatUrl?: string | null;
}) {
  const weeksTotal = input.weeksTotal ?? 5;
  return prisma.challengeCohort.create({
    data: {
      name: input.name,
      productSlug: input.productSlug,
      weeksTotal,
      week1StartAt: input.week1StartAt,
      isActive: input.isActive ?? true,
      accessPassword: input.accessPassword ?? null,
      openChatUrl: input.openChatUrl ?? null,
      weeks: {
        create: Array.from({ length: weeksTotal }, (_, i) => {
          const openAt = new Date(input.week1StartAt.getTime() + i * 7 * 24 * 60 * 60 * 1000);
          return {
            weekIndex: i + 1,
            title: `Week ${i + 1}`,
            openAt,
            homeworkDueAt: defaultHomeworkDueAt(openAt),
            liveAt: defaultLiveAt(openAt, i + 1),
          };
        }),
      },
    },
    include: { weeks: true },
  });
}
