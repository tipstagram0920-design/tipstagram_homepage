/**
 * 5주 챌린지 온보딩 — 등록 직후 몇 번의 클릭으로 그 사람에게 맞는 커리큘럼을 좁혀준다.
 *
 * 질문은 트리다. Q1(상품 유무)에서 갈라지고, 그 뒤 두 질문은 공통이다.
 *   Q1 상품 있음 → Q2A 업종 6개
 *   Q1 상품 없음 → Q2B 방향 3개 (퍼스널 브랜딩 · 쿠팡 파트너스 · 인스타 보너스)
 *   Q3 계정 상태 → Q4 5주 뒤 목표
 *
 * 용어는 상세페이지(상품 판매형 · 매장형 · 미용업 · 강의형)와 일부러 똑같이 맞췄다.
 * 판매 페이지에서 본 단어를 등록 직후에 다시 보게 하려는 것.
 *
 * 이 파일은 순수 데이터·계산만 한다. DB·세션을 모르므로 서버/클라이언트 양쪽에서 쓸 수 있다.
 */

export type HasProduct = "yes" | "no";

/** Q2 선택지 id — 상품 있음(6) + 상품 없음(3) */
export type TrackId =
  | "commerce"
  | "store"
  | "beauty"
  | "teaching"
  | "expert"
  | "other"
  | "branding"
  | "coupang"
  | "bonus";

export type AccountStage = "none" | "dormant" | "quiet" | "running";
export type Goal = "inquiry" | "followers" | "revenue" | "habit";

export interface OnboardingAnswers {
  hasProduct?: HasProduct;
  track?: TrackId;
  /** 무엇을 팔지(또는 무엇을 다룰지) 한 줄. 1주차 Q1에 그대로 프리필된다. */
  productNote?: string;
  stage?: AccountStage;
  goal?: Goal;
}

/** productNote 저장 상한 */
export const PRODUCT_NOTE_MAX = 300;

export interface Choice<T extends string> {
  id: T;
  /** lucide-react 아이콘 이름 (컴포넌트에서 매핑) */
  icon: string;
  title: string;
  desc: string;
  /** 카드 좌측 배지 색 */
  tone: "pink" | "violet" | "amber" | "emerald" | "sky" | "neutral";
}

export const PRODUCT_CHOICES: Choice<HasProduct>[] = [
  {
    id: "yes",
    icon: "PackageCheck",
    title: "네, 지금 파는 게 있습니다",
    desc: "상품·서비스·매장 무엇이든 이미 돈을 받고 있다면 여기입니다. 사람만 모으면 됩니다.",
    tone: "pink",
  },
  {
    id: "no",
    icon: "Sprout",
    title: "아니요, 아직 없습니다",
    desc: "괜찮습니다. 상품이 없어도 시작할 수 있습니다. 어디서 시작할지만 정하면 됩니다.",
    tone: "violet",
  },
];

export const TRACK_CHOICES_YES: Choice<TrackId>[] = [
  {
    id: "commerce",
    icon: "ShoppingBag",
    title: "상품 판매형",
    desc: "스마트스토어 · 자사몰 · 공동구매 · 실물 상품",
    tone: "pink",
  },
  {
    id: "store",
    icon: "Store",
    title: "매장형",
    desc: "카페 · 음식점 · 학원 · 공방 등 손님이 찾아오는 곳",
    tone: "amber",
  },
  {
    id: "beauty",
    icon: "Scissors",
    title: "미용업",
    desc: "피부 · 네일 · 헤어 · 에스테틱 · 왁싱",
    tone: "violet",
  },
  {
    id: "teaching",
    icon: "GraduationCap",
    title: "강의 · 코칭형",
    desc: "클래스 · 1:1 코칭 · 컨설팅 · 전자책 · 온라인 강의",
    tone: "emerald",
  },
  {
    id: "expert",
    icon: "Stethoscope",
    title: "전문 서비스",
    desc: "병원 · 한의원 · 법률 · 세무 · 부동산 · 상담",
    tone: "sky",
  },
  {
    id: "other",
    icon: "Shapes",
    title: "그 외 · 아직 정리가 안 됐어요",
    desc: "위에 딱 맞는 게 없어도 됩니다. 1주차에 같이 정리합니다.",
    tone: "neutral",
  },
];

export const TRACK_CHOICES_NO: Choice<TrackId>[] = [
  {
    id: "branding",
    icon: "UserRound",
    title: "퍼스널 브랜딩",
    desc: "내 경험과 전문성 자체를 상품으로 만듭니다. 나중에 강의 · 코칭 · 협업으로 이어집니다.",
    tone: "violet",
  },
  {
    id: "coupang",
    icon: "Link2",
    title: "쿠팡 파트너스",
    desc: "남의 상품을 소개하고 수수료를 받습니다. 상품을 안 만들어도 되니 첫 수익이 가장 빠릅니다.",
    tone: "amber",
  },
  {
    id: "bonus",
    icon: "Play",
    title: "인스타그램 보너스",
    desc: "메타가 조회수에 주는 보너스입니다. 파는 것 없이 콘텐츠만으로 수익이 납니다.",
    tone: "pink",
  },
];

export const STAGE_CHOICES: Choice<AccountStage>[] = [
  {
    id: "none",
    icon: "CirclePlus",
    title: "계정이 아직 없어요",
    desc: "완전히 처음부터 시작합니다.",
    tone: "neutral",
  },
  {
    id: "dormant",
    icon: "Moon",
    title: "만들어는 뒀는데 거의 안 올려요",
    desc: "계정은 있지만 사실상 멈춰 있습니다.",
    tone: "sky",
  },
  {
    id: "quiet",
    icon: "TrendingDown",
    title: "올리는데 반응이 없어요",
    desc: "꾸준히 올리는데 팔로워가 1,000명 아래에서 안 늘어납니다.",
    tone: "amber",
  },
  {
    id: "running",
    icon: "TrendingUp",
    title: "어느 정도 돌아가요",
    desc: "팔로워 1,000명 이상. 다음 단계로 못 넘어가는 게 문제입니다.",
    tone: "emerald",
  },
];

export const GOAL_CHOICES: Choice<Goal>[] = [
  {
    id: "inquiry",
    icon: "MessageSquareText",
    title: "첫 문의 · 첫 주문 받기",
    desc: "DM이나 주문이 실제로 들어오는 걸 보고 싶습니다.",
    tone: "pink",
  },
  {
    id: "followers",
    icon: "Users",
    title: "팔로워 1,000명 넘기기",
    desc: "일단 사람이 모이는 걸 먼저 만들고 싶습니다.",
    tone: "violet",
  },
  {
    id: "revenue",
    icon: "TrendingUp",
    title: "지금 매출을 두 배로",
    desc: "이미 팔리고 있고, 규모를 키우고 싶습니다.",
    tone: "emerald",
  },
  {
    id: "habit",
    icon: "Repeat",
    title: "꾸준히 올리는 게 습관 되기",
    desc: "매번 멈추는 게 제일 큰 문제입니다.",
    tone: "amber",
  },
];

/* ── 결과: 사람마다 달라지는 5주 ─────────────────────────────── */

interface TrackProfile {
  label: string;
  /** "당신은 ___ 입니다" 한 줄 */
  persona: string;
  /** 1주차에 정할 것 */
  target: string;
  /** 콘텐츠의 축 */
  axis: string;
  /** 4주차 자동화를 어디에 쓰나 */
  automate: string;
  /** 돈이 되는 지점 */
  money: string;
}

const TRACKS: Record<TrackId, TrackProfile> = {
  commerce: {
    label: "상품 판매형",
    persona: "팔 물건은 있는데, 그 물건을 찾을 사람이 아직 안 모인 상태",
    target: "내 상품을 사는 사람이 아니라, 그 상품이 해결하는 문제를 겪는 사람",
    axis: "상품 자랑이 아니라 그 문제를 다루는 콘텐츠. 상품은 마지막 장에만 나옵니다.",
    automate: "신상·재입고·사용법 카드뉴스를 매주 자동으로 찍어냅니다.",
    money: "프로필 링크 → 스토어. 광고비 없이 내 스토어로 사람을 부릅니다.",
  },
  store: {
    label: "매장형",
    persona: "동네에서는 알지만, 인스타에서는 아직 아무도 모르는 상태",
    target: "우리 가게 반경 안에서 '오늘 갈 데'를 찾는 사람",
    axis: "메뉴 사진이 아니라 '여기 왜 가야 하는지'. 사장님 얼굴과 이야기가 콘텐츠입니다.",
    automate: "이 주의 메뉴 · 영업 안내 · 이벤트를 카드뉴스로 자동 발행합니다.",
    money: "저장 → 지도 저장 → 방문. 인스타 보고 찾아오는 손님이 생깁니다.",
  },
  beauty: {
    label: "미용업",
    persona: "실력은 있는데, 그 실력이 화면에서 안 보이는 상태",
    target: "지금 그 고민(모발·피부·체형)을 검색하고 있는 사람",
    axis: "비포애프터 하나로 끝내지 말고, 왜 그렇게 됐는지를 설명하는 콘텐츠.",
    automate: "시술 전후 · 홈케어 팁 카드뉴스를 매주 자동으로 만듭니다.",
    money: "DM 예약. 예약이 댓글이 아니라 DM으로 들어오게 만듭니다.",
  },
  teaching: {
    label: "강의 · 코칭형",
    persona: "가르칠 게 있는데, 왜 당신에게 배워야 하는지가 아직 안 보이는 상태",
    target: "내가 예전에 겪었던 그 문제를 지금 겪고 있는 사람",
    axis: "지식 나열이 아니라 '내가 어떻게 넘었는지'. 과거의 나 이야기가 가장 셉니다.",
    automate: "강의 핵심 요약 · 수강생 변화 카드뉴스를 자동으로 뽑습니다.",
    money: "무료자료 → 신청 페이지. 지식이 상품이 되는 가장 빠른 길입니다.",
  },
  expert: {
    label: "전문 서비스",
    persona: "자격은 확실한데, 사람들이 어려워서 못 다가오는 상태",
    target: "전문 용어를 몰라서 물어볼 데가 없는 사람",
    axis: "권위가 아니라 번역. 어려운 걸 쉽게 말해주는 사람이 신뢰를 받습니다.",
    automate: "자주 묻는 질문을 카드뉴스로 계속 쌓습니다. 쌓일수록 검색에 걸립니다.",
    money: "상담 신청. 문턱을 낮춘 첫 상담이 매출의 입구입니다.",
  },
  other: {
    label: "아직 정리 전",
    persona: "파는 건 있는데 그게 뭔지 한 줄로 말하기 어려운 상태",
    target: "1주차에 '누구를 모을지'부터 같이 정합니다.",
    axis: "정리가 먼저입니다. 콘텐츠는 그다음입니다.",
    automate: "방향이 잡히면 그때 자동화를 붙입니다.",
    money: "3주차 1:1에서 직접 뚫어드립니다.",
  },
  branding: {
    label: "퍼스널 브랜딩",
    persona: "팔 상품은 없지만, 넘어온 경험이 있는 상태 — 그게 재료입니다",
    target: "3년 전의 나. 지금 내가 넘어온 그 자리에 서 있는 사람",
    axis: "정보가 아니라 이야기. before → after 가 콘텐츠의 뼈대입니다.",
    automate: "내 이야기를 조각내서 매주 카드뉴스로 뽑습니다.",
    money: "사람이 먼저, 상품은 나중. 모인 다음에 강의·코칭·협업이 붙습니다.",
  },
  coupang: {
    label: "쿠팡 파트너스",
    persona: "만들 상품은 없지만, 남의 상품을 팔아 첫 수익을 만들 수 있는 상태",
    target: "이 상품을 살까 말까 지금 고민 중인 사람",
    axis: "상품 링크 나열은 죽습니다. '이걸 왜 샀는지'가 콘텐츠입니다.",
    automate: "상품 비교 · 추천 카드뉴스를 대량으로 자동 생산합니다. 개수가 곧 수익입니다.",
    money: "링크 클릭 → 수수료. 상품이 없어도 이번 달에 첫 수익이 납니다.",
  },
  bonus: {
    label: "인스타그램 보너스",
    persona: "파는 것 없이, 조회수 자체를 수익으로 바꾸는 자리",
    target: "특정 고객이 아니라 '끝까지 보는 사람'",
    axis: "저장·공유가 아니라 시청 완료율. 첫 1초가 전부입니다.",
    automate: "릴스 소재와 자막을 자동으로 뽑아 발행 개수를 늘립니다.",
    money: "조회수 = 보너스. 판매 매출과 별개로 들어옵니다.",
  },
};

const STAGE_NOTE: Record<AccountStage, string> = {
  none: "계정부터 만듭니다. 아이디 · 프로필 · 첫 9개 게시물까지 1주차 안에 끝냅니다.",
  dormant: "기존 계정을 갈아엎을지 새로 팔지부터 정합니다. 대부분은 갈아엎는 게 빠릅니다.",
  quiet: "올리는 양이 아니라 방향이 문제입니다. 1주차 타겟 재정의부터 다시 합니다.",
  running: "기초는 건너뜁니다. 3주차 1:1과 5주차 수익화에 시간을 몰아씁니다.",
};

const GOAL_NOTE: Record<Goal, string> = {
  inquiry: "5주 안에 DM 한 통을 받는 게 목표입니다. 그 한 통이 나머지를 증명합니다.",
  followers: "1,000명은 숫자가 아니라 '알고리즘이 나를 인식하는 선'입니다. 여기까지 밀어붙입니다.",
  revenue: "이미 팔리고 있으니 새로 만들 게 아니라 새는 곳을 막습니다. 3주차에 직접 봅니다.",
  habit: "의지로 하면 무조건 멈춥니다. 4주차 자동화까지 가서 '안 하면 이상한 상태'를 만듭니다.",
};

export interface WeekPlan {
  index: number;
  title: string;
  line: string;
}

export interface OnboardingPlan {
  trackLabel: string;
  persona: string;
  stageNote: string;
  goalNote: string;
  weeks: WeekPlan[];
}

/** 답변 4개 → 이 사람용 5주. 답이 덜 찼으면 null. */
export function buildPlan(a: OnboardingAnswers): OnboardingPlan | null {
  if (!a.hasProduct || !a.track || !a.stage || !a.goal) return null;
  const t = TRACKS[a.track];
  return {
    trackLabel: t.label,
    persona: t.persona,
    stageNote: STAGE_NOTE[a.stage],
    goalNote: GOAL_NOTE[a.goal],
    weeks: [
      { index: 1, title: "누구를 모을지 정한다", line: t.target },
      { index: 2, title: "콘텐츠의 축을 잡는다", line: t.axis },
      { index: 3, title: "1:1로 직접 뜯어본다", line: `${t.label} 기준으로 계정을 열어보고 막힌 지점을 짚습니다.` },
      { index: 4, title: "자동화로 손을 뗀다", line: t.automate },
      { index: 5, title: "돈이 되는 길을 연결한다", line: t.money },
    ],
  };
}

export function trackChoices(hasProduct: HasProduct): Choice<TrackId>[] {
  return hasProduct === "yes" ? TRACK_CHOICES_YES : TRACK_CHOICES_NO;
}

/* ── 저장값 읽기·검증 ────────────────────────────────────────── */

const HAS_PRODUCT_IDS = PRODUCT_CHOICES.map((c) => c.id);
const TRACK_IDS = [...TRACK_CHOICES_YES, ...TRACK_CHOICES_NO].map((c) => c.id);
const STAGE_IDS = STAGE_CHOICES.map((c) => c.id);
const GOAL_IDS = GOAL_CHOICES.map((c) => c.id);

/** DB(Json)나 요청 본문에서 온 값을 검증해 답으로 만든다. 값이 이상하면 그 항목만 버린다. */
export function parseOnboarding(raw: unknown): OnboardingAnswers {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const pick = <T extends string>(v: unknown, allowed: readonly T[]): T | undefined =>
    typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : undefined;

  const note = typeof o.productNote === "string" ? o.productNote.trim().slice(0, PRODUCT_NOTE_MAX) : "";
  const hasProduct = pick(o.hasProduct, HAS_PRODUCT_IDS);
  const track = pick(o.track, TRACK_IDS);

  return {
    ...(hasProduct ? { hasProduct } : {}),
    // 상품 유무와 트랙이 서로 안 맞으면(예: 있음 + 쿠팡) 트랙을 버린다
    ...(track && (!hasProduct || trackChoices(hasProduct).some((c) => c.id === track))
      ? { track }
      : {}),
    ...(note ? { productNote: note } : {}),
    ...(pick(o.stage, STAGE_IDS) ? { stage: pick(o.stage, STAGE_IDS) } : {}),
    ...(pick(o.goal, GOAL_IDS) ? { goal: pick(o.goal, GOAL_IDS) } : {}),
  };
}

/** 게이트를 통과할 만큼 답했는지 (productNote 는 선택) */
export function isOnboardingComplete(a: OnboardingAnswers | null | undefined): boolean {
  return Boolean(a?.hasProduct && a?.track && a?.stage && a?.goal);
}

/** 관리자 화면·AI 프롬프트에서 쓰는 한 줄 요약 (예: "매장형 · 첫 문의 · 계정 없음") */
export function onboardingSummary(a: OnboardingAnswers | null | undefined): string {
  if (!a) return "";
  const parts: string[] = [];
  if (a.track) parts.push(TRACKS[a.track].label);
  if (a.goal) parts.push(GOAL_CHOICES.find((c) => c.id === a.goal)?.title ?? "");
  if (a.stage) parts.push(STAGE_CHOICES.find((c) => c.id === a.stage)?.title ?? "");
  return parts.filter(Boolean).join(" · ");
}

/** AI 피드백 프롬프트 맨 앞에 붙일 참가자 소개 */
export function onboardingBriefing(a: OnboardingAnswers | null | undefined): string {
  if (!isOnboardingComplete(a) || !a) return "";
  const t = TRACKS[a.track!];
  const lines = [
    `- 유형: ${t.label} (${a.hasProduct === "yes" ? "파는 것이 이미 있음" : "아직 파는 것이 없음"})`,
    a.productNote ? `- 무엇을 파는지(다루는지): ${a.productNote}` : "",
    `- 지금 상태: ${STAGE_CHOICES.find((c) => c.id === a.stage)?.title ?? ""}`,
    `- 5주 뒤 목표: ${GOAL_CHOICES.find((c) => c.id === a.goal)?.title ?? ""}`,
    `- 이 유형이 모아야 할 사람: ${t.target}`,
  ].filter(Boolean);
  return `[참가자 배경 — 시작 전에 본인이 고른 것]\n${lines.join("\n")}`;
}

/* ── 트랙별로 달라지는 문구 ──────────────────────────────────── */

/** 게이트 3번째 질문(무엇을 파는지) — 트랙마다 묻는 말이 다르다 */
export const PRODUCT_NOTE_COPY: Record<
  TrackId,
  { title: string; desc: string; placeholder: string; optional?: boolean }
> = {
  commerce: {
    title: "어떤 상품을 파시나요?",
    desc: "대표 상품 하나면 됩니다. 이름과 한 줄 설명을 같이 적어주세요.",
    placeholder: "예: 산청 곶감 선물세트 · 3만원대 명절 선물용",
  },
  store: {
    title: "어떤 가게인가요?",
    desc: "무엇을 파는 곳인지, 어디에 있는지 한 줄로.",
    placeholder: "예: 성수동 브런치 카페 · 수제 스콘과 드립커피",
  },
  beauty: {
    title: "어떤 시술을 하시나요?",
    desc: "주력 시술 하나면 됩니다.",
    placeholder: "예: 두피 관리 · 탈모 초기 케어 10회 프로그램",
  },
  teaching: {
    title: "무엇을 가르치시나요?",
    desc: "어떤 사람에게 무엇을 가르치는지 한 줄로.",
    placeholder: "예: 직장인 대상 엑셀 자동화 온라인 클래스 4주 과정",
  },
  expert: {
    title: "어떤 서비스를 하시나요?",
    desc: "무엇을 봐주는 곳인지 한 줄로.",
    placeholder: "예: 1인 사업자 세무 기장 · 종합소득세 신고 대행",
  },
  other: {
    title: "지금 파는 것을 아는 만큼만 적어주세요",
    desc: "정리가 안 돼 있어도 괜찮습니다. 1주차에 같이 정리합니다.",
    placeholder: "예: 손뜨개 소품을 만드는데 뭘 주력으로 할지 아직 모르겠어요",
    optional: true,
  },
  branding: {
    title: "어떤 이야기를 다루실 건가요?",
    desc: "내가 넘어온 경험 중 하나면 됩니다. 아직 모르겠으면 비워두세요.",
    placeholder: "예: 3년간의 육아 우울증을 넘어온 이야기",
    optional: true,
  },
  coupang: {
    title: "어떤 상품을 소개하실 건가요?",
    desc: "내가 실제로 써봤고 남에게 권할 수 있는 분야면 좋습니다.",
    placeholder: "예: 자취방 주방용품 · 실제로 써본 것 위주",
    optional: true,
  },
  bonus: {
    title: "어떤 주제로 영상을 만드실 건가요?",
    desc: "끝까지 보게 만들 수 있는 주제 하나. 아직 모르겠으면 비워두세요.",
    placeholder: "예: 하루 5분 자취 요리",
    optional: true,
  },
};

/** 1주차 숙제 Q1 — 트랙에 따라 묻는 말이 달라진다 */
export const WEEK1_Q1_COPY: Record<
  TrackId,
  { label: string; help: string; itemLabel: string; namePlaceholder: string; descPlaceholder: string }
> = {
  commerce: {
    label: "팔고 싶은 것 또는 팔고 있는 것은 무엇인가요?",
    help: "여러 개라면 카드를 추가해서 각각 남겨 주세요.",
    itemLabel: "상품",
    namePlaceholder: "상품·서비스·콘텐츠 이름",
    descPlaceholder: "한두 문장으로 설명 · 가격·형태·핵심 결과가 드러나면 더 좋아요",
  },
  store: {
    label: "우리 가게는 무엇을 파나요?",
    help: "대표 메뉴·서비스를 카드로 나눠 적어주세요.",
    itemLabel: "메뉴 · 서비스",
    namePlaceholder: "메뉴·서비스 이름",
    descPlaceholder: "가격과 특징 · 왜 이걸 먹으러(하러) 와야 하는지",
  },
  beauty: {
    label: "어떤 시술·관리를 하시나요?",
    help: "주력 시술부터 카드로 나눠 적어주세요.",
    itemLabel: "시술",
    namePlaceholder: "시술·프로그램 이름",
    descPlaceholder: "가격·회차·어떤 고민을 해결하는 시술인지",
  },
  teaching: {
    label: "무엇을 가르치시나요?",
    help: "강의·코칭·전자책 등 파는 것을 카드로 나눠 적어주세요.",
    itemLabel: "강의 · 코칭",
    namePlaceholder: "강의·코칭·자료 이름",
    descPlaceholder: "기간·형태·수강 후 무엇이 달라지는지",
  },
  expert: {
    label: "어떤 서비스를 제공하시나요?",
    help: "상담·대행 등 파는 것을 카드로 나눠 적어주세요.",
    itemLabel: "서비스",
    namePlaceholder: "서비스 이름",
    descPlaceholder: "비용·진행 방식·어떤 문제를 해결해 주는지",
  },
  other: {
    label: "팔고 싶은 것 또는 팔고 있는 것은 무엇인가요?",
    help: "정리가 안 돼 있어도 괜찮습니다. 아는 만큼만 적으면 1주차에 같이 정리합니다.",
    itemLabel: "상품",
    namePlaceholder: "상품·서비스·콘텐츠 이름",
    descPlaceholder: "한두 문장으로 설명 · 지금 아는 만큼만",
  },
  branding: {
    label: "어떤 이야기·전문성을 콘텐츠로 만들 건가요?",
    help: "파는 상품이 아니라 '내가 넘어온 것'이 재료입니다. 여러 개면 카드를 추가하세요.",
    itemLabel: "주제",
    namePlaceholder: "다룰 주제 한 줄",
    descPlaceholder: "이 주제를 내가 말할 수 있는 이유 · 내가 겪은 것",
  },
  coupang: {
    label: "어떤 상품을 소개하실 건가요?",
    help: "내 상품이 아니라 소개할 상품입니다. 실제로 써본 것부터 카드로 적어주세요.",
    itemLabel: "소개할 상품",
    namePlaceholder: "상품 이름 · 카테고리",
    descPlaceholder: "왜 이걸 소개하려는지 · 내가 써보고 좋았던 점",
  },
  bonus: {
    label: "어떤 주제로 영상을 만드실 건가요?",
    help: "파는 것이 아니라 '끝까지 보게 만들 주제'입니다. 여러 개면 카드를 추가하세요.",
    itemLabel: "주제",
    namePlaceholder: "다룰 주제 한 줄",
    descPlaceholder: "이 주제를 계속 만들 수 있는 이유 · 어떤 사람이 볼지",
  },
};

/** 트랙 라벨 하나만 필요할 때 */
export function trackLabel(track: TrackId | undefined | null): string {
  return track ? TRACKS[track].label : "";
}
