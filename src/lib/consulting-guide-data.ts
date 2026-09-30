/**
 * 컨설팅 숙제 도우미가 저장하는 데이터의 공유 타입.
 *
 * 숙제는 앞에서 뒤로 이어진다.
 *   나의 스토리(my-story) → 소비자 선정·프로필(customer-select) → 페이지 4종(link-pages) → 랜딩페이지(landing-page)
 * 뒤 숙제가 앞 숙제의 답을 읽어 미리 채우기 때문에, 타입을 한곳에 모아둔다.
 */

/** 1일차 — 나의 스토리 · 전문성 */
export interface MyStoryData {
  origin?: string; // 이 일을 어떻게 시작했나
  turningPoint?: string; // 문제를 넘을 때 가장 중요했던 것
  howSolved?: string; // 지금은 그 문제를 어떻게 해결했나
  expertise?: string; // 전문성·경력
  numbers?: string; // 증명 가능한 숫자
}

/** 1일차 — 소비자 선정 → 프로필 추천 */
export interface CustomerSelectData {
  // ① 참여자 본인의 이야기 (프로필 1줄·3줄의 재료)
  myProblem?: string; // 나도 겪었던, 소비자와 똑같은 문제
  myTurning?: string; // 그때 나를 바꾼 결정적인 한 가지
  myProof?: string; // 내가 이 말을 할 수 있는 근거 (경력·숫자·후기)
  whyThem?: string; // 왜 하필 이 사람들을 돕고 싶은가

  // ② 소비자
  problems?: string[];
  change?: string;
  personaLine?: string;
  personaDetail?: string;
  expertise?: string;

  // ③ 추천받은 3개 중 확정한 프로필 — 다음 숙제로 넘어가는 값
  chosenName?: string;
  finalLines?: string[];
}

/** 2일차 — 상담·주문(랜딩) 페이지 글 */
export type LandingKey =
  | "problem"
  | "loss"
  | "myStory"
  | "solution"
  | "product"
  | "reviews"
  | "composition"
  | "faq"
  | "bonusNow"
  | "addedValue"
  | "cta";

export interface PageSection {
  heading: string;
  body: string;
}

/** @deprecated PageSection 을 쓴다 (이름만 남겨둠) */
export type LandingSection = PageSection;

/**
 * AI가 써준 페이지 글. 랜딩페이지·무료자료·후기·FAQ 페이지가 모두 이 형태를 쓴다.
 * deliverable 은 "페이지 글과 별개로 나오는 결과물" —
 * 무료자료의 자료 목차, 무료체험의 진행 순서, 이벤트의 참여 방법 같은 것.
 */
export interface PageCopy {
  headline: string;
  subheadline: string;
  sections: PageSection[];
  ctaLine: string;
  tips: string[];
  deliverable?: { title: string; items: PageSection[] } | null;
}

export type LandingCopy = PageCopy;

export type LandingPageData = Partial<Record<LandingKey, string>> & {
  /** 마지막으로 생성한 랜딩 글 (다시 들어와도 그대로 보이게 저장) */
  copy?: PageCopy | null;
  /** 만든 상담·주문 페이지 주소 — 인포크 숙제가 물어간다 */
  url?: string;
  /** 앞 숙제 값으로 한 번 미리 채웠는지 — 두 번 덮어쓰지 않기 위한 표시 */
  prefilled?: boolean;
};

/** 무료자료 페이지 숙제에서 고르는 유형 */
export type FreebieKind = "freebie" | "trial" | "event";

/** 페이지 만들기 숙제(무료자료·후기·FAQ)가 공통으로 저장하는 값 */
export interface PageBuilderData {
  /** 무료자료 숙제에서만 쓰는 유형 선택 */
  kind?: FreebieKind;
  /** 질문 답변 (질문 목록은 숙제마다 다르다) */
  fields?: Record<string, string>;
  /** 마지막으로 생성한 페이지 글 */
  copy?: PageCopy | null;
  /** 만들어서 올린 페이지 주소 — 인포크 숙제가 물어간다 */
  url?: string;
  prefilled?: boolean;
}

/** 인포크 링크에 넣을 페이지 4개의 주소 (앞 숙제들에서 모아온 값) */
export interface PageUrls {
  freebieUrl: string;
  proofUrl: string;
  faqUrl: string;
  contactUrl: string;
}

/** 뒤 숙제가 읽어가는 앞 숙제 답 묶음 */
export interface GuideContext {
  story: MyStoryData | null;
  customer: CustomerSelectData | null;
  /** 무료자료·후기·FAQ·상담 페이지에서 모아온 주소 */
  pages: PageUrls;
  /** 무료자료 숙제에서 고른 유형 (안내 문구를 유형에 맞추려고) */
  freebieKind: FreebieKind | null;
}

/** 확정 프로필 3줄을 한 덩어리 텍스트로 */
export function profileText(lines?: string[] | null): string {
  return (lines ?? []).map((l) => (l ?? "").trim()).filter(Boolean).join("\n");
}

/** 생성된 페이지 글을 복붙용 한 덩어리 텍스트로 (클라이언트에서도 쓴다) */
export function pageCopyToText(copy: PageCopy): string {
  const parts: string[] = [];
  if (copy.headline) parts.push(copy.headline);
  if (copy.subheadline) parts.push(copy.subheadline);
  for (const s of copy.sections) {
    parts.push(`【 ${s.heading} 】\n${s.body}`);
  }
  if (copy.ctaLine) parts.push(`👉 ${copy.ctaLine}`);
  return parts.join("\n\n");
}

/** 별도 결과물(자료 목차·체험 순서·참여 방법)을 복붙용 텍스트로 */
export function deliverableToText(copy: PageCopy): string {
  const d = copy.deliverable;
  if (!d || !d.items?.length) return "";
  return [d.title, ...d.items.map((i) => `【 ${i.heading} 】\n${i.body}`)]
    .filter(Boolean)
    .join("\n\n");
}

/** 예전 이름 (랜딩페이지 도우미·관리자 화면이 쓰고 있다) */
export const landingCopyToText = pageCopyToText;

/** 비어 있지 않은 문제만 */
export function filledProblems(d?: CustomerSelectData | null): string[] {
  return (d?.problems ?? []).map((p) => (p ?? "").trim()).filter(Boolean);
}
