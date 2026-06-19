import { prisma } from "@/lib/prisma";

const KST_OFFSET_MIN = 9 * 60;

function atKst(base: Date, offsetDays: number, time: string): Date {
  const [hh, mm] = time.split(":").map(Number);
  const target = new Date(base);
  target.setUTCDate(target.getUTCDate() + offsetDays);
  let utcHour = hh - 9;
  let dayShift = 0;
  if (utcHour < 0) { utcHour += 24; dayShift = -1; }
  target.setUTCHours(utcHour, mm, 0, 0);
  target.setUTCDate(target.getUTCDate() + dayShift);
  void KST_OFFSET_MIN; // unused-marker
  return target;
}

interface TaskSeed {
  title: string;
  detail: string;
  base: "webinar" | "endDate";
  offsetDays: number;
  time: string;
}

const SEED: TaskSeed[] = [
  {
    title: "D-10 메일 발송됨 — 카톡방·인스타에도 안내 게시",
    detail: "오늘 D-10 메일이 발송됐어요. 같은 톤의 짧은 안내를 카톡 오픈채팅방·인스타 스토리에도 올려서 도달을 늘려주세요.",
    base: "webinar", offsetDays: -10, time: "09:30",
  },
  {
    title: "D-7: 1차 전자책 트래픽 점검",
    detail: "어드민 → 전자책 신청 현황에서 최근 신청 추이 확인. 트래픽이 적으면 추가 안내 또는 광고 검토.",
    base: "webinar", offsetDays: -7, time: "09:30",
  },
  {
    title: "D-3: 후기 영상·이미지 점검",
    detail: "D-3 메일에 들어간 후기 영상이 정상 재생되는지 본인 메일에서 확인.",
    base: "webinar", offsetDays: -3, time: "10:00",
  },
  {
    title: "D-1: 사전 질문 답변 정리",
    detail: "사전 질문 폼 답변을 라이브 진행 자료에 통합. 어드민 → 진단 세션 신청 페이지도 함께 검토.",
    base: "webinar", offsetDays: -1, time: "14:00",
  },
  {
    title: "라이브 1시간 전: 줌 입장·세팅",
    detail: "줌 입장 → 화면 공유·녹화·소리 테스트. 카톡방에 입장 URL 한 번 더 안내.",
    base: "webinar", offsetDays: 0, time: "19:00",
  },
  {
    title: "라이브 직후: 다시보기 영상 업로드",
    detail: "녹화 영상을 Vimeo/YouTube에 업로드 → 어드민 Setting webinar_zoom_url 또는 별도 다시보기 URL을 업데이트.",
    base: "webinar", offsetDays: 0, time: "22:00",
  },
  {
    title: "D+1: 다시보기 메일 발송됨 — URL 확인",
    detail: "D+1 메일이 발송됐어요. 본인 메일에서 다시보기 링크가 잘 들어갔는지·재생되는지 확인.",
    base: "webinar", offsetDays: 1, time: "10:00",
  },
  {
    title: "D+2: 진단 세션 5명 선정",
    detail: "어드민 → 진단 세션 신청 페이지에서 5명 골라 status를 '선정'으로 변경. 선정자에게 별도 안내 메일 발송도 고려.",
    base: "webinar", offsetDays: 2, time: "10:00",
  },
  {
    title: "마감 D-3: 정원 진척 확인",
    detail: "어드민 → 컨택트·구매 통계 확인. 카톡방에 정원 진척 상황 게시 (희소성 강화).",
    base: "endDate", offsetDays: -3, time: "09:30",
  },
  {
    title: "마감 D-1: 마지막 알림",
    detail: "마감 D-1 메일이 발송됐어요. 카톡방·인스타 스토리에 24시간 카운트다운 게시.",
    base: "endDate", offsetDays: -1, time: "09:30",
  },
  {
    title: "마감 직후: 수강생 정리·강의실 권한 부여",
    detail: "구매자 명단 확인 → 어드민에서 강의실 권한 일괄 부여. 다음 기수 일정·가격 정리.",
    base: "endDate", offsetDays: 0, time: "21:30",
  },
  {
    title: "마감 +3: 마감 후 회고 + 다음 기수 일정 공지",
    detail: "이번 기수 KPI(라이브 신청→구매 전환율) 정리. 다음 기수 모집 일정·가격 결정 후 라이브 페이지 갱신.",
    base: "endDate", offsetDays: 3, time: "10:00",
  },
];

export async function seedOperatorTasksForCampaign(
  campaignId: string,
  webinarDate: Date,
  endDate: Date | null
) {
  const data = SEED.filter((s) => s.base === "webinar" || endDate).map((s) => ({
    title: s.title,
    detail: s.detail,
    scheduledAt: atKst(s.base === "webinar" ? webinarDate : (endDate as Date), s.offsetDays, s.time),
    campaignId,
  }));
  if (data.length === 0) return 0;
  const result = await prisma.operatorTask.createMany({ data });
  return result.count;
}

export async function deleteOperatorTasksForCampaign(campaignId: string) {
  await prisma.operatorTask.deleteMany({
    where: { campaignId, status: { in: ["pending", "notified"] } },
  });
}
