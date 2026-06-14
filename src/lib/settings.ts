import { prisma } from "@/lib/prisma";

export const SETTING_KEYS = {
  kakaoChatUrl: "kakao_open_chat_url",
  ebookUrl: "live_ebook_url",
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
