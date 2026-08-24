"use client";

import { MyStoryGuide } from "./MyStoryGuide";
import { CustomerSelectGuide } from "./CustomerSelectGuide";
import { LinkPagesGuide } from "./LinkPagesGuide";
import { InpockLinkGuide } from "./InpockLinkGuide";
import { HighlightGuide } from "./HighlightGuide";
import { LandingPageGuide } from "./LandingPageGuide";
import { ReelsReferenceGuide } from "./ReelsReferenceGuide";
import { ReelsUploadGuide } from "./ReelsUploadGuide";

export const GUIDE_LABELS: Record<string, string> = {
  "my-story": "나의 스토리 · 전문성 정리",
  "customer-select": "소비자 선정 → 프로필 추천",
  "link-pages": "링크에 넣을 페이지 4종",
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
}: {
  guideKey: string;
  taskId: string;
  data: unknown;
}) {
  const d = (data ?? null) as never;
  switch (guideKey) {
    case "my-story":
      return <MyStoryGuide taskId={taskId} initialData={d} />;
    case "link-pages":
      return <LinkPagesGuide taskId={taskId} initialData={d} />;
    case "customer-select":
      return <CustomerSelectGuide taskId={taskId} initialData={d} />;
    case "inpock-link":
      return <InpockLinkGuide taskId={taskId} initialData={d} />;
    case "highlight":
      return <HighlightGuide taskId={taskId} initialData={d} />;
    case "landing-page":
      return <LandingPageGuide taskId={taskId} initialData={d} />;
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
