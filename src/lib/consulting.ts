import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";

export const CONSULTING_DURATION_DAYS = 21;
export const CONSULTING_PASSWORD_KEY = "consulting_access_password";
// 카테고리(guideKey)별 참고 강의(marketing-booster lesson id) 매핑 저장 키
export const CONSULTING_REF_VIDEO_KEY = "consulting_ref_videos";

// 참고 영상을 붙일 수 있는 숙제 카테고리 (guideKey → 라벨)
export const CONSULTING_REF_CATEGORIES: { guideKey: string; label: string }[] = [
  { guideKey: "customer-select", label: "소비자 선정 · 프로필" },
  { guideKey: "inpock-link", label: "인포크(링크인바이오) 링크" },
  { guideKey: "highlight", label: "하이라이트" },
  { guideKey: "landing-page", label: "랜딩페이지" },
  { guideKey: "reels-reference", label: "릴스 기획" },
  { guideKey: "reels-upload", label: "릴스 업로드" },
];

// 저장된 매핑을 파싱해 { guideKey: lessonId } 로 반환
export async function getConsultingRefVideoMap(): Promise<Record<string, string>> {
  const raw = await getSetting(CONSULTING_REF_VIDEO_KEY);
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? (obj as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export interface TaskSeed {
  day: number;
  endDay?: number; // 여러 날에 걸치는 숙제의 마감 Day
  title: string;
  description?: string;
  guideKey?: string;
}

// 등록일(Day 1) 기준 기본 21일 일정. 등록 시 이 템플릿이 고객별로 복제되고,
// 이후 고객·관리자가 자유롭게 수정/추가/삭제할 수 있다.
// guideKey가 있는 할 일에는 입력→결과 도우미/생성기가 붙는다.
export const DEFAULT_CONSULTING_TASKS: TaskSeed[] = [
  // 1주차 — 세팅(Day 1~3) + 릴스 1회차(Day 4~6)
  { day: 1, title: "소비자 선정 → 프로필 추천", description: "3가지 방법으로 소비자 문제 5개를 찾고, 변화·페르소나를 입력하면 프로필 추천이 나와요. 탭해서 작성하세요.", guideKey: "customer-select" },
  { day: 1, title: "인포크(링크인바이오) 링크 만들기", description: "무료·이벤트 → 후기 → 상품안내·FAQ → 상담 순서로 버튼을 배치하세요. 도우미에 영상·순서 가이드가 있어요.", guideKey: "inpock-link" },
  { day: 2, title: "하이라이트 수정", description: "무료·이벤트 → 후기 → FAQ → 상담하러가기 순으로. 커버 이모티콘 사이트와 제작 순서는 도우미 참고.", guideKey: "highlight" },
  { day: 2, title: "무료자료(리드마그넷) 만들기", description: "잠재 고객을 모을 무료 자료를 하나 만들어 배포 준비하세요." },
  { day: 3, title: "랜딩페이지 만들기", description: "항목을 채우면 복붙용 랜딩페이지 글이 완성돼요. 탭해서 작성하세요.", guideKey: "landing-page" },
  { day: 3, title: "이벤트 만들기", description: "참여를 유도할 이벤트(체험·챌린지·할인 등)를 기획해 공지하세요." },

  { day: 4, title: "릴스 기획 (1회차) — 레퍼런스 5개 찾기 + 변형 기획", description: "레퍼런스 5개를 찾아 저장하고 계정에 들어가 더 모은 뒤, 내 콘텐츠로 변형해 5개를 기획하세요.", guideKey: "reels-reference" },
  { day: 5, title: "릴스 5개 촬영 (1회차)", description: "기획한 릴스 5개를 촬영하세요." },
  { day: 6, endDay: 10, title: "릴스 업로드 (1회차) — 5일간 매일 1개", description: "촬영 다음날부터 하루에 하나씩 5일간 업로드하세요. 그날 올린 릴스 URL을 도우미에 붙여넣으면 관리자가 확인해요.", guideKey: "reels-upload" },
  { day: 7, title: "1주차 점검 · 반응 확인", description: "조회수·저장·프로필 방문 등 반응을 확인하고 잘 된 포맷을 메모하세요." },

  // 2주차 — 보완(Day 8~10) + 릴스 2회차(Day 11~13)
  { day: 8, title: "프로필·하이라이트 보완", description: "반응을 보고 프로필/하이라이트를 다듬으세요." },
  { day: 9, title: "랜딩페이지·무료자료 보완", description: "전환이 잘 되는지 점검하고 문구·구성을 보완하세요." },
  { day: 10, title: "이벤트 반응 점검", description: "이벤트 참여·문의 반응을 확인하고 다음 액션을 정하세요." },
  { day: 11, title: "릴스 기획 (2회차) — 레퍼런스 5개 찾기 + 변형 기획", description: "이번 주 레퍼런스 5개를 저장하고 계정에서 더 모은 뒤, 5개를 기획하세요.", guideKey: "reels-reference" },
  { day: 12, title: "릴스 5개 촬영 (2회차)", description: "기획한 릴스 5개를 촬영하세요." },
  { day: 13, endDay: 17, title: "릴스 업로드 (2회차) — 5일간 매일 1개", description: "촬영 다음날부터 하루에 하나씩 5일간 업로드하세요. 그날 올린 릴스 URL을 도우미에 붙여넣으세요.", guideKey: "reels-upload" },
  { day: 14, title: "2주차 점검", description: "2주차 콘텐츠 반응을 분석하고 개선점을 정리하세요." },

  // 3주차 — 분석(Day 15~17) + 릴스 3회차(Day 18~20)
  { day: 15, title: "성과 분석", description: "조회수·저장·프로필 방문·문의 등을 분석해 잘 된 콘텐츠를 찾으세요." },
  { day: 16, title: "잘 된 콘텐츠 파악", description: "반응 좋았던 콘텐츠의 공통점(주제·포맷·후킹)을 정리하세요." },
  { day: 17, title: "개선 아이디어 정리", description: "다음 릴스에 반영할 개선 아이디어를 정리하세요." },
  { day: 18, title: "릴스 기획 (3회차) — 레퍼런스 5개 찾기 + 변형 기획", description: "마지막 주 레퍼런스 5개를 저장하고 계정에서 더 모은 뒤, 5개를 기획하세요.", guideKey: "reels-reference" },
  { day: 19, title: "릴스 5개 촬영 (3회차)", description: "기획한 릴스 5개를 촬영하세요." },
  { day: 20, endDay: 24, title: "릴스 업로드 (3회차) — 5일간 매일 1개", description: "촬영 다음날부터 하루에 하나씩 5일간 업로드하세요. 그날 올린 릴스 URL을 도우미에 붙여넣으세요.", guideKey: "reels-upload" },
  { day: 21, title: "3주 회고 + 다음 액션 플랜", description: "3주 성과를 정리하고 앞으로의 콘텐츠·판매 계획을 세우세요." },
];

// ---------------------------------------------------------------------------
// 등록 메모 (관리자가 등록 시 입력한 내용) — 첫 번째 할 일 설명 맨 위에 붙는다.
// 별도 컬럼 없이 첫 할 일 description에 마커로 보관하므로, 할 일 초기화 시에도
// 아래 extractIntakeNote()로 읽어 복원한다.
// ---------------------------------------------------------------------------
const INTAKE_HEAD = "[등록 메모]";
const INTAKE_SEP = "———";

/** 첫 할 일 설명 앞에 등록 메모를 덧붙인다. 메모가 비어 있으면 원본 그대로. */
export function buildFirstTaskDescription(base: string, note?: string | null): string {
  const n = (note ?? "").trim();
  if (!n) return base;
  return `${INTAKE_HEAD}\n${n}\n${INTAKE_SEP}\n${base}`;
}

/** 설명을 { 등록 메모, 본문 }으로 분리한다. 메모가 없으면 note = null. */
export function splitIntakeNote(description: string): { note: string | null; body: string } {
  const note = extractIntakeNote(description);
  if (!note) return { note: null, body: description };
  const sepIdx = description.indexOf(`\n${INTAKE_SEP}\n`);
  return { note, body: description.slice(sepIdx + INTAKE_SEP.length + 2) };
}

/** 첫 할 일 설명에서 등록 메모만 뽑아낸다. 없으면 null. */
export function extractIntakeNote(description: string): string | null {
  if (!description.startsWith(`${INTAKE_HEAD}\n`)) return null;
  const sepIdx = description.indexOf(`\n${INTAKE_SEP}\n`);
  if (sepIdx < 0) return null;
  const note = description.slice(INTAKE_HEAD.length + 1, sepIdx).trim();
  return note || null;
}

/** 템플릿 시드 → ConsultingTask create 입력으로 변환 (첫 항목에 등록 메모 주입) */
function buildTaskRows(intakeNote?: string | null) {
  return DEFAULT_CONSULTING_TASKS.map((t, i) => ({
    day: t.day,
    endDay: t.endDay ?? null,
    order: i,
    title: t.title,
    description:
      i === 0
        ? buildFirstTaskDescription(t.description ?? "", intakeNote)
        : (t.description ?? ""),
    guideKey: t.guideKey ?? null,
  }));
}

export async function getConsultingPassword(): Promise<string | null> {
  const pw = await getSetting(CONSULTING_PASSWORD_KEY);
  return pw && pw.trim() ? pw.trim() : null;
}

// 컨설팅 등록자에게 자동으로 열어줄 동영상 강의(메인 66강)
export const CONSULTING_COURSE_SLUG = "marketing-booster";

// 강의 접근권을 부여(멱등). classroom은 non-refunded Purchase 여부로 접근을 판단하므로 Purchase를 만든다.
async function grantConsultingCourse(userId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: CONSULTING_COURSE_SLUG },
      select: { id: true },
    });
    if (!product) return;
    const existing = await prisma.purchase.findFirst({
      where: { userId, productId: product.id, refundedAt: null },
    });
    if (existing) return; // 이미 구매/부여됨
    await prisma.purchase.create({
      data: {
        userId,
        productId: product.id,
        amount: 0, // 컨설팅 무료 제공분
        orderId: `consulting-grant-${userId}`, // 유저당 1건(전역 unique)
      },
    });
  } catch {
    // 강의 부여 실패가 컨설팅 등록을 막지 않도록 삼킴
  }
}

// 등록: 이미 있으면 그대로 반환, 없으면 생성 + 기본 21일(3주) 할 일 시드.
// opts.intakeNote — 등록 시 입력한 내용. 첫 번째 할 일 설명 맨 위에 들어간다.
// opts.startAt   — Day 1 기준일. 생략하면 지금.
// 강의 접근권은 항상 보장(멱등).
export async function ensureConsultingEnrollment(
  userId: string,
  opts?: { intakeNote?: string | null; startAt?: Date }
) {
  await grantConsultingCourse(userId); // 강의 자동 등록
  const existing = await prisma.consultingEnrollment.findUnique({
    where: { userId },
  });
  if (existing) return existing;
  return prisma.consultingEnrollment.create({
    data: {
      userId,
      ...(opts?.startAt ? { startAt: opts.startAt } : {}),
      tasks: { create: buildTaskRows(opts?.intakeNote) },
    },
  });
}

// 이 등록의 할 일을 최신 기본 템플릿으로 초기화 (기존 할 일·입력값 삭제 후 재생성).
// 등록 시 입력한 메모는 기존 첫 할 일에서 읽어 그대로 복원한다.
export async function resetEnrollmentTasks(enrollmentId: string) {
  const first = await prisma.consultingTask.findFirst({
    where: { enrollmentId },
    orderBy: [{ day: "asc" }, { order: "asc" }],
    select: { description: true },
  });
  const intakeNote = first ? extractIntakeNote(first.description) : null;

  await prisma.consultingTask.deleteMany({ where: { enrollmentId } });
  await prisma.consultingTask.createMany({
    data: buildTaskRows(intakeNote).map((t) => ({ ...t, enrollmentId })),
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
