"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

/**
 * 마운트 시 page_view 1건 기록. UTM은 자동 캡처.
 * 사용: 페이지 최상단에 <TrackerPixel page="live" /> 처럼 추가.
 */
export function TrackerPixel({ page }: { page?: string }) {
  useEffect(() => {
    track("page_view", page ? { page } : undefined);
    // mount-only intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
