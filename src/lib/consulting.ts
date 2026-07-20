import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";

export const CONSULTING_DURATION_DAYS = 21;
export const CONSULTING_PASSWORD_KEY = "consulting_access_password";

export interface TaskSeed {
  day: number;
  title: string;
  description?: string;
}

// 등록일(Day 1) 기준 기본 21일 일정. 등록 시 이 템플릿이 고객별로 복제되고,
// 이후 고객·관리자가 자유롭게 수정/추가/삭제할 수 있다.
export const DEFAULT_CONSULTING_TASKS: TaskSeed[] = [
  // 1주차 — 세팅 + 첫 릴스 사이클
  { day: 1, title: "프로필 수정", description: "한 줄 소개·프로필 사진·대표 링크를 콘셉트에 맞게 정비하세요." },
  { day: 2, title: "하이라이트 수정", description: "커버·순서·이름을 정리하고 필수 하이라이트(무료자료·후기·FAQ·문의)를 세팅하세요." },
  { day: 3, title: "랜딩페이지 만들기", description: "내 상품 소개 랜딩페이지를 만들고 링크를 프로필에 연결하세요." },
  { day: 4, title: "무료자료(리드마그넷) 만들기", description: "잠재 고객을 모을 무료 자료를 하나 만들어 배포 준비하세요." },
  { day: 5, title: "이벤트 만들기", description: "참여를 유도할 이벤트(체험·챌린지·할인 등)를 기획해 공지하세요." },
  { day: 6, title: "레퍼런스 릴스 5개 찾기 + 변형 기획", description: "내 주제에 맞는 레퍼런스 릴스 5개를 찾고, 내 것으로 변형할 기획안을 잡으세요." },
  { day: 7, title: "릴스 5개 촬영 & 업로드", description: "기획한 릴스 5개를 촬영하고 순차 업로드하세요." },

  // 2주차 — 콘텐츠 사이클
  { day: 8, title: "레퍼런스 릴스 5개 찾기", description: "이번 주 콘텐츠용 레퍼런스 릴스 5개를 새로 찾으세요." },
  { day: 9, title: "레퍼런스 변형해서 기획", description: "찾은 레퍼런스를 내 콘텐츠로 변형해 5개 기획안을 만드세요." },
  { day: 10, title: "릴스 5개 촬영", description: "기획한 릴스 5개를 촬영하세요." },
  { day: 11, title: "릴스 업로드", description: "촬영한 릴스를 업로드하고 캡션·해시태그를 정리하세요." },
  { day: 12, title: "프로필·하이라이트 점검·보완", description: "지금까지 반응을 보고 프로필/하이라이트를 다듬으세요." },
  { day: 13, title: "랜딩페이지·무료자료 점검·보완", description: "전환이 잘 되는지 점검하고 문구·구성을 보완하세요." },
  { day: 14, title: "이벤트 반응 점검", description: "이벤트 참여·문의 반응을 확인하고 다음 액션을 정하세요." },

  // 3주차 — 반복·최적화
  { day: 15, title: "레퍼런스 릴스 5개 찾기", description: "마지막 주 콘텐츠용 레퍼런스 릴스 5개를 찾으세요." },
  { day: 16, title: "레퍼런스 변형해서 기획", description: "5개 기획안을 만드세요." },
  { day: 17, title: "릴스 5개 촬영", description: "기획한 릴스 5개를 촬영하세요." },
  { day: 18, title: "릴스 업로드", description: "촬영한 릴스를 업로드하세요." },
  { day: 19, title: "성과 분석", description: "조회수·저장·프로필 방문·문의 등을 분석해 잘 된 콘텐츠를 찾으세요." },
  { day: 20, title: "잘 된 콘텐츠 리믹스", description: "반응 좋았던 콘텐츠를 변형·재활용해 추가 제작하세요." },
  { day: 21, title: "3주 회고 + 다음 액션 플랜", description: "3주 성과를 정리하고 앞으로의 콘텐츠·판매 계획을 세우세요." },
];

export async function getConsultingPassword(): Promise<string | null> {
  const pw = await getSetting(CONSULTING_PASSWORD_KEY);
  return pw && pw.trim() ? pw.trim() : null;
}

// 등록: 이미 있으면 그대로 반환, 없으면 생성 + 기본 할 일 시드
export async function ensureConsultingEnrollment(userId: string) {
  const existing = await prisma.consultingEnrollment.findUnique({
    where: { userId },
  });
  if (existing) return existing;
  return prisma.consultingEnrollment.create({
    data: {
      userId,
      tasks: {
        create: DEFAULT_CONSULTING_TASKS.map((t, i) => ({
          day: t.day,
          order: i,
          title: t.title,
          description: t.description ?? "",
        })),
      },
    },
  });
}

// 등록일 기준 "오늘"이 며칠째인지 (1부터 시작, 등록 전이면 0 이하)
export function currentDayIndex(startAt: Date, now: Date = new Date()): number {
  const startMidnight = new Date(startAt);
  startMidnight.setHours(0, 0, 0, 0);
  const nowMidnight = new Date(now);
  nowMidnight.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (nowMidnight.getTime() - startMidnight.getTime()) / (24 * 60 * 60 * 1000)
  );
  return diffDays + 1;
}
