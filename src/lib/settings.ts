import { prisma } from "@/lib/prisma";

export const SETTING_KEYS = {
  kakaoChatUrl: "kakao_open_chat_url",
  ebookUrl: "live_ebook_url",
  /** 외부 결제 URL. 비어있으면 내부 토스 결제 흐름 사용. */
  externalCheckoutUrl: "external_checkout_url",
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
