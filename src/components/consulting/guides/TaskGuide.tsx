"use client";

import { MyStoryGuide } from "./MyStoryGuide";
import { CustomerSelectGuide } from "./CustomerSelectGuide";
import { LinkPagesGuide } from "./LinkPagesGuide";
import { FreebiePageGuide } from "./FreebiePageGuide";
import { ProofPageGuide } from "./ProofPageGuide";
import { FaqPageGuide } from "./FaqPageGuide";
import { InpockLinkGuide } from "./InpockLinkGuide";
import { HighlightGuide } from "./HighlightGuide";
import { LandingPageGuide } from "./LandingPageGuide";
import { ReelsReferenceGuide } from "./ReelsReferenceGuide";
import { ReelsUploadGuide } from "./ReelsUploadGuide";
import type { GuideContext } from "@/lib/consulting-guide-data";

export const GUIDE_LABELS: Record<string, string> = {
  "my-story": "나의 스토리 · 전문성 정리",
  "customer-select": "소비자 선정 → 프로필 추천",
  "link-pages": "링크에 넣을 페이지 4종",
  "freebie-page": "무료자료·체험·이벤트 페이지 만들기",
  "proof-page": "후기·변화 스토리 페이지 만들기",
  "faq-page": "자주 묻는 질문 페이지 만들기",
  "inpock-link": "인포크 링크 순서 가이드",
  highlight: "하이라이트 제작 가이드",
  "landing-page": "랜딩페이지 글 생성기",
  "reels-reference-first": "퍼스널 스토리 + 레퍼런스 4개",
  "reels-reference": "레퍼런스 릴스 5개 수집",
  "reels-upload": "업로드 릴스 URL 제출",
};

export function TaskGuide({
  guideKey,
  taskId,
  data,
  context,
  next,
  siblings,
}: {
  guideKey: string;
  taskId: string;
  data: unknown;
  /** 같은 등록의 앞 숙제 답 — 뒤 숙제를 미리 채우는 데 쓴다 */
  context?: GuideContext | null;
  /** 다음 숙제 (숙제끼리 이어주는 카드용) */
  next?: { id: string; title: string; day: number } | null;
  /** 같은 등록의 숙제 목록 — 앞 숙제로 돌아가는 링크를 걸 때 쓴다 */
  siblings?: { id: string; guideKey: string | null }[];
}) {
  const d = (data ?? null) as never;
  switch (guideKey) {
    case "my-story":
      return <MyStoryGuide taskId={taskId} initialData={d} />;
    case "link-pages":
      return <LinkPagesGuide taskId={taskId} initialData={d} context={context} />;
    case "customer-select":
      return <CustomerSelectGuide taskId={taskId} initialData={d} context={context} next={next} />;
    case "freebie-page":
      return <FreebiePageGuide taskId={taskId} initialData={d} context={context} next={next} />;
    case "proof-page":
      return <ProofPageGuide taskId={taskId} initialData={d} context={context} next={next} />;
    case "faq-page":
      return <FaqPageGuide taskId={taskId} initialData={d} context={context} next={next} />;
    case "inpock-link":
      return (
        <InpockLinkGuide
          taskId={taskId}
          initialData={d}
          context={context}
          siblings={siblings}
        />
      );
    case "highlight":
      return <HighlightGuide taskId={taskId} initialData={d} />;
    case "landing-page":
      return <LandingPageGuide taskId={taskId} initialData={d} context={context} next={next} />;
    case "reels-reference-first":
      return <ReelsReferenceGuide taskId={taskId} initialData={d} requireStory />;
    case "reels-reference":
      return <ReelsReferenceGuide taskId={taskId} initialData={d} />;
    case "reels-upload":
      return <ReelsUploadGuide taskId={taskId} initialData={d} />;
    default:
      return null;
  }
}
