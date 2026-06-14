import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type EventType =
  | "live_signup"
  | "register"
  | "purchase"
  | "lesson_complete"
  | "email_sent"
  | "kakao_sent"
  | "sms_sent"
  | "email_opened"
  | "email_clicked"
  | "tag_added"
  | "manual_note"
  | "post_create"
  | "unsubscribe";

/**
 * 이벤트 기록 + Contact 카운터 캐시 갱신.
 * silent: 실패해도 throw 안 함(부수효과라 메인 흐름 막지 않게).
 */
export async function logEvent(
  contactId: string,
  type: EventType,
  payload?: Record<string, unknown>
) {
  try {
    const event = await prisma.event.create({
      data: {
        contactId,
        type,
        payload: (payload ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });

    // 카운터 캐시 업데이트
    if (type === "live_signup") {
      await prisma.contact.update({
        where: { id: contactId },
        data: { liveSignupCount: { increment: 1 } },
      });
    } else if (type === "purchase") {
      const amount = typeof payload?.amount === "number" ? payload.amount : 0;
      await prisma.contact.update({
        where: { id: contactId },
        data: {
          purchaseCount: { increment: 1 },
          totalSpent: { increment: amount },
        },
      });
    }

    return event;
  } catch (e) {
    console.error("logEvent 실패:", e);
    return null;
  }
}
