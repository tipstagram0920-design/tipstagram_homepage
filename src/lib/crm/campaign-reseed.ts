import { prisma } from "@/lib/prisma";
import { PRESET_STEPS } from "./webinar-preset";
import { seedBroadcastsForCampaign } from "./kakao-broadcast-preset";

/**
 * 캠페인 URL·링크가 변경되면 이메일 시퀀스와 카톡 draft를 다시 만든다.
 *
 * - 이메일 steps: 프리셋으로 완전히 대체 (변수는 발송 시점에 최신 값 치환됨)
 * - 카톡 미발송 draft: 삭제 후 재시드 (draft body에 URL이 embed돼 있어 재생성 필수)
 * - 이미 발송된 이메일 send / 이미 알림 발송된(notified) 카톡 draft는 손대지 않음.
 */
export async function reseedCampaignSequences(campaignId: string): Promise<{
  emailSteps: number;
  broadcasts: { created: number; skipped: number; skippedPast: number; deleted: number };
}> {
  // 1) 이메일 시퀀스: 프리셋으로 재설정
  await prisma.webinarCampaign.update({
    where: { id: campaignId },
    data: { steps: PRESET_STEPS as unknown as object },
  });

  // 2) 카톡 draft: 미발송(scheduled)만 삭제 후 재시드. 발송 완료(notified)/취소(canceled)는 유지.
  const deleted = await prisma.broadcastDraft.deleteMany({
    where: {
      notes: { contains: `[campaign:${campaignId}:step:` },
      status: "scheduled",
    },
  });
  const seeded = await seedBroadcastsForCampaign(campaignId);

  return {
    emailSteps: PRESET_STEPS.length,
    broadcasts: {
      created: seeded.created,
      skipped: seeded.skipped,
      skippedPast: seeded.skippedPast,
      deleted: deleted.count,
    },
  };
}

/**
 * PUT 요청 body와 기존 캠페인을 비교하여, URL·링크 계열 필드가 하나라도 바뀌었는지 판단.
 */
export function hasUrlLinkChange(
  incoming: Record<string, unknown>,
  existing: {
    zoomUrl: string | null;
    salesUrl: string | null;
    kakaoChatUrl: string | null;
    replayUrl: string | null;
    preQuestionUrl: string | null;
  }
): boolean {
  const norm = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
  const fields: Array<keyof typeof existing> = [
    "zoomUrl",
    "salesUrl",
    "kakaoChatUrl",
    "replayUrl",
    "preQuestionUrl",
  ];
  for (const f of fields) {
    if (!(f in incoming)) continue;
    const before = existing[f] ?? "";
    const after = norm(incoming[f]);
    // extractFirstUrl 유틸이 요청 처리 중 트림·정제하므로 여기선 문자열 비교로 충분.
    if (before !== after) return true;
  }
  return false;
}
