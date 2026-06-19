import { prisma } from "@/lib/prisma";

export const SETTING_KEYS = {
  kakaoChatUrl: "kakao_open_chat_url",
  ebookUrl: "live_ebook_url",
  /** 외부 결제 URL. 비어있으면 내부 토스 결제 흐름 사용. */
  externalCheckoutUrl: "external_checkout_url",
  /** 1차 전자책 파일 URL */
  ebook1Url: "ebook1_url",
  /** 2차 전자책 파일 URL */
  ebook2Url: "ebook2_url",
  /** 인스타 스토리 인증용 태그 (예: @tipstagram2023) */
  ebook2VerifyTag: "ebook2_verify_tag",
  /** 웨비나 입장 줌 URL */
  webinarZoomUrl: "webinar_zoom_url",
  /** 사전 질문 폼 URL */
  webinarPreQuestionUrl: "webinar_pre_question_url",
  /** 진단 신청 URL (메일 변수용) */
  consultationUrl: "consultation_url",
} as const;

export async function getSetting(key: string): Promise<string | null> {
  try {
    const s = await prisma.setting.findUnique({ where: { key } });
    return s?.value ?? null;
  } catch {
    return null;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
