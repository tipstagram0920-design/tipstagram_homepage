import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";

export const CONSULTING_DURATION_DAYS = 21;
export const CONSULTING_PASSWORD_KEY = "consulting_access_password";
// 카테고리(guideKey)별 참고 강의(marketing-booster lesson id) 매핑 저장 키
export const CONSULTING_REF_VIDEO_KEY = "consulting_ref_videos";

// 참고 영상을 붙일 수 있는 숙제 카테고리 (guideKey → 라벨)
export const CONSULTING_REF_CATEGORIES: { guideKey: string; label: string }[] = [
  { guideKey: "my-story", label: "나의 스토리 · 전문성" },
  { guideKey: "customer-select", label: "소비자 선정 · 프로필" },
  { guideKey: "freebie-page", label: "무료자료·체험·이벤트 페이지" },
  { guideKey: "proof-page", label: "후기·변화 스토리 페이지" },
  { guideKey: "faq-page", label: "자주 묻는 질문 페이지" },
  { guideKey: "link-pages", label: "링크에 넣을 페이지 4종 (구)" },
  { guideKey: "inpock-link", label: "인포크(링크인바이오) 링크" },
  { guideKey: "highlight", label: "하이라이트" },
  { guideKey: "landing-page", label: "랜딩페이지" },
  { guideKey: "reels-reference-first", label: "릴스 기획 (1회차·스토리)" },
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
  // 1주차 — 나를 정리(Day 1) → 페이지 만들기(Day 2~3) → 링크·하이라이트(Day 4) → 릴스 1회차(Day 5~)
  //
  // 순서 원칙 두 가지:
  //  1) "내가 누구인가"가 먼저다. 소비자·프로필·릴스가 전부 여기서 나온다.
  //  2) 링크는 넣을 페이지가 있어야 만들 수 있다. 그래서 페이지 4개를 먼저 만들고 인포크로 간다.
  { day: 1, title: "나의 스토리 · 전문성 정리", description: "이 일을 시작한 계기, 문제를 넘은 방법, 내 전문성을 정리해요. 이후 모든 숙제(소비자·프로필·릴스)의 재료가 되니 여기부터 채워주세요.", guideKey: "my-story" },
  { day: 1, title: "소비자 선정 → 프로필 추천", description: "내 이야기(나도 겪은 문제·나를 바꾼 한 가지)를 먼저 쓰고, 3가지 방법으로 소비자 문제 5개를 찾으세요. 그 두 가지를 합쳐 프로필 3버전을 추천받고, 하나를 확정하면 다음 숙제로 그대로 넘어갑니다.", guideKey: "customer-select" },

  // 인포크 링크에 넣을 페이지 4개를 실제로 만드는 구간 (Day 2~3)
  { day: 2, title: "① 무료자료·체험·이벤트 페이지 만들기", description: "링크 맨 위에 들어갈 페이지예요. 무료자료·무료체험·이벤트 중 하나를 고르면 그에 맞는 질문이 나오고, 페이지 글과 나눠줄 자료 초안까지 만들어 드려요.", guideKey: "freebie-page" },
  { day: 2, title: "② 후기·변화 스토리 페이지 만들기", description: "믿을 이유가 없으면 무료자료도 안 받습니다. 후기가 있으면 후기로, 없으면 앞 숙제에 쓴 내 변화 스토리로 페이지를 만들어요.", guideKey: "proof-page" },

  { day: 3, title: "③ 자주 묻는 질문 페이지 만들기", description: "문의로 오는 질문의 90%는 정해져 있어요. 가격·기간·환불·초보 가능 여부를 미리 답해두면 상담이 '살까 말까'에서 시작합니다.", guideKey: "faq-page" },
  { day: 3, title: "④ 상담·주문 페이지 글 쓰기", description: "앞 숙제(내 이야기·소비자 문제·확정 프로필)로 항목이 미리 채워져 있어요. 다듬고 버튼을 누르면 복붙용 랜딩페이지 글이 완성됩니다.", guideKey: "landing-page" },

  // 페이지 4개가 준비된 다음에야 링크를 만든다
  { day: 4, title: "인포크(링크인바이오) 링크 만들기", description: "앞에서 만든 페이지 4개 주소가 자동으로 채워져 있어요. 무료·이벤트 → 후기 → FAQ → 상담 순서로 배치하세요.", guideKey: "inpock-link" },
  { day: 4, title: "하이라이트 수정", description: "무료·이벤트 → 후기 → FAQ → 상담하러가기 순으로. 커버 이모티콘 사이트와 제작 순서는 도우미 참고.", guideKey: "highlight" },

  { day: 5, title: "릴스 기획 (1회차) — 퍼스널 스토리 1개 + 레퍼런스 변형 4개", description: "1회차에는 내 과거 스토리 영상을 반드시 1개 넣습니다. 나머지 4개는 레퍼런스를 찾아 내 콘텐츠로 변형하세요.", guideKey: "reels-reference-first" },
  { day: 6, title: "릴스 5개 촬영 (1회차)", description: "기획한 릴스 5개를 촬영하세요. 퍼스널 스토리 영상부터 찍는 걸 권합니다." },
  { day: 7, endDay: 11, title: "릴스 업로드 (1회차) — 5일간 매일 1개", description: "촬영 다음날부터 하루에 하나씩 5일간 업로드하세요. 퍼스널 스토리 영상을 가장 먼저 올리세요. 그날 올린 릴스 URL을 도우미에 붙여넣으면 관리자가 확인해요.", guideKey: "reels-upload" },
  { day: 7, title: "1주차 점검 · 반응 확인", description: "조회수·저장·프로필 방문 등 반응을 확인하고 잘 된 포맷을 메모하세요." },

  // 2주차 — 보완(Day 8~10) + 릴스 2회차(Day 11~13)
  { day: 8, title: "프로필·하이라이트 보완", description: "반응을 보고 프로필/하이라이트를 다듬으세요. 프로필 3줄이 여전히 맞는지 다시 보세요." },
  { day: 9, title: "페이지 4종 보완", description: "무료자료·후기·FAQ·상담 페이지에서 어디서 이탈하는지 보고 문구를 보완하세요." },
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

// 예전 템플릿의 제목 → 지금 템플릿의 guideKey.
// 제목만 다를 뿐 같은 숙제라, 새로 만들지 말고 기존 숙제를 그대로 이어 쓴다(완료 체크가 보존된다).
const LEGACY_TITLES: Record<string, string[]> = {
  "freebie-page": ["무료자료(리드마그넷) 만들기", "무료자료 만들기", "이벤트 만들기"],
  "landing-page": ["랜딩페이지 만들기"],
  "reels-reference-first": ["릴스 기획 (1회차) — 레퍼런스 5개 찾기 + 변형 기획"],
};

/**
 * 이 등록을 현재 템플릿에 맞춘다. **아무것도 지우지 않는다.**
 *  - 템플릿에 있는데 없는 숙제 → 추가
 *  - 이미 있는 숙제 → Day·순서만 템플릿 위치로 이동 (작성한 답·완료 체크는 그대로)
 *  - 템플릿에 없는 숙제(직접 추가한 것 등) → Day는 두고 그 날의 맨 뒤로 밀어둠
 *
 * 예전 등록자는 인포크 링크가 Day 1에 있는 식으로 순서가 달라서, 추가만으로는 흐름이 맞지 않는다.
 * (resetEnrollmentTasks 는 전부 지우고 다시 만들기 때문에 진행 중인 고객에게는 쓸 수 없다)
 */
export async function syncEnrollmentTasks(
  enrollmentId: string
): Promise<{ added: number; moved: number; leftover: number }> {
  const existing = await prisma.consultingTask.findMany({
    where: { enrollmentId },
    orderBy: [{ day: "asc" }, { order: "asc" }],
    select: { id: true, day: true, endDay: true, order: true, title: true, guideKey: true, description: true },
  });

  // 같은 guideKey 가 템플릿에 여러 번 나오면(릴스 기획·업로드) 어느 것과 짝인지 알 수 없다.
  // 그런 숙제는 옮기지 않고 그대로 둔다.
  const keyCount = new Map<string, number>();
  for (const t of DEFAULT_CONSULTING_TASKS) {
    if (t.guideKey) keyCount.set(t.guideKey, (keyCount.get(t.guideKey) ?? 0) + 1);
  }

  // 등록 메모는 맨 앞 숙제 설명에 들어 있다. 순서가 바뀌어도 잃지 않도록 미리 빼둔다.
  const intakeNote =
    existing.map((t) => extractIntakeNote(t.description)).find((n) => n) ?? null;

  const used = new Set<string>();
  const updates: {
    id: string;
    day: number;
    endDay: number | null;
    order: number;
    title?: string;
    description?: string;
    guideKey?: string | null;
  }[] = [];
  const creates: {
    enrollmentId: string;
    day: number;
    endDay: number | null;
    order: number;
    title: string;
    description: string;
    guideKey: string | null;
  }[] = [];

  DEFAULT_CONSULTING_TASKS.forEach((t, i) => {
    const titles = [t.title.trim(), ...(t.guideKey ? LEGACY_TITLES[t.guideKey] ?? [] : [])];
    const match =
      (t.guideKey && keyCount.get(t.guideKey) === 1
        ? existing.find((e) => !used.has(e.id) && e.guideKey === t.guideKey)
        : undefined) ??
      existing.find((e) => !used.has(e.id) && titles.includes(e.title.trim()));

    if (match) {
      used.add(match.id);
      const endDay = t.endDay ?? null;
      const desc = t.description ?? "";
      const moved = match.day !== t.day || match.order !== i || match.endDay !== endDay;
      // 제목·도우미도 최신으로 갈아끼운다.
      // 예전 제목으로 남아 있으면 도우미(guideKey)가 안 붙어서 생성기를 못 쓴다.
      const relabel =
        match.title.trim() !== t.title.trim() ||
        match.guideKey !== (t.guideKey ?? null) ||
        splitIntakeNote(match.description).body.trim() !== desc.trim();
      if (moved || relabel) {
        updates.push({
          id: match.id,
          day: t.day,
          endDay,
          order: i,
          ...(relabel
            ? { title: t.title, description: desc, guideKey: t.guideKey ?? null }
            : {}),
        });
      }
      return;
    }
    creates.push({
      enrollmentId,
      day: t.day,
      endDay: t.endDay ?? null,
      order: i,
      title: t.title,
      description: t.description ?? "",
      guideKey: t.guideKey ?? null,
    });
  });

  // 템플릿에 없는 숙제는 지우지 않고, 그 날의 맨 뒤로만 밀어둔다
  const leftovers = existing.filter((e) => !used.has(e.id));
  leftovers.forEach((e, i) => {
    const order = DEFAULT_CONSULTING_TASKS.length + i;
    if (e.order !== order) updates.push({ id: e.id, day: e.day, endDay: e.endDay, order });
  });

  await prisma.$transaction(async (tx) => {
    for (const u of updates) {
      await tx.consultingTask.update({
        where: { id: u.id },
        data: {
          day: u.day,
          endDay: u.endDay,
          order: u.order,
          ...(u.title !== undefined ? { title: u.title } : {}),
          ...(u.description !== undefined ? { description: u.description } : {}),
          ...(u.guideKey !== undefined ? { guideKey: u.guideKey } : {}),
        },
      });
    }
    if (creates.length) await tx.consultingTask.createMany({ data: creates });
  });

  // 등록 메모를 새 맨 앞 숙제로 옮겨준다 (원래 있던 자리에서는 지운다)
  if (intakeNote) await moveIntakeNote(enrollmentId, intakeNote);

  return { added: creates.length, moved: updates.length, leftover: leftovers.length };
}

/** 등록 메모를 지금 맨 앞에 있는 숙제 설명으로 옮긴다 */
async function moveIntakeNote(enrollmentId: string, note: string) {
  const tasks = await prisma.consultingTask.findMany({
    where: { enrollmentId },
    orderBy: [{ day: "asc" }, { order: "asc" }],
    select: { id: true, description: true },
  });
  if (tasks.length === 0) return;
  const first = tasks[0];
  for (const t of tasks) {
    const has = extractIntakeNote(t.description);
    if (t.id === first.id) continue;
    if (has) {
      await prisma.consultingTask.update({
        where: { id: t.id },
        data: { description: splitIntakeNote(t.description).body },
      });
    }
  }
  if (!extractIntakeNote(first.description)) {
    await prisma.consultingTask.update({
      where: { id: first.id },
      data: { description: buildFirstTaskDescription(first.description, note) },
    });
  }
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
