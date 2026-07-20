"use client";

import { ProfileBioGuide } from "./ProfileBioGuide";
import { InpockLinkGuide } from "./InpockLinkGuide";
import { HighlightGuide } from "./HighlightGuide";
import { LandingPageGuide } from "./LandingPageGuide";
import { ReelsReferenceGuide } from "./ReelsReferenceGuide";

export const GUIDE_LABELS: Record<string, string> = {
  "profile-bio": "3줄 바이오 만들기 도우미",
  "inpock-link": "인포크 링크 순서 가이드",
  highlight: "하이라이트 제작 가이드",
  "landing-page": "랜딩페이지 글 생성기",
  "reels-reference": "레퍼런스 릴스 5개 수집",
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
    case "profile-bio":
      return <ProfileBioGuide taskId={taskId} initialData={d} />;
    case "inpock-link":
      return <InpockLinkGuide taskId={taskId} initialData={d} />;
    case "highlight":
      return <HighlightGuide taskId={taskId} initialData={d} />;
    case "landing-page":
      return <LandingPageGuide taskId={taskId} initialData={d} />;
    case "reels-reference":
      return <ReelsReferenceGuide taskId={taskId} initialData={d} />;
    default:
      return null;
  }
}
