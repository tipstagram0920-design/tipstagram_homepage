import { prisma } from "@/lib/prisma";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { KakaoSendClient } from "./KakaoSendClient";

export const dynamic = "force-dynamic";

export default async function KakaoSendPage() {
  const [apiKey, sender, pfId] = await Promise.all([
    getSetting(SETTING_KEYS.solapiApiKey),
    getSetting(SETTING_KEYS.solapiSenderNumber),
    getSetting(SETTING_KEYS.solapiKakaoPfId),
  ]);
  const configured = !!(apiKey || process.env.SOLAPI_API_KEY) && !!(sender || process.env.SOLAPI_SENDER_NUMBER) && !!(pfId || process.env.SOLAPI_KAKAO_PFID);

  // 전화번호 보유 컨택트 수 / 마케팅(친구톡) 수신 동의 수
  const [phoneCount, consentCount, taggedContacts] = await Promise.all([
    prisma.contact.count({ where: { phone: { not: null } } }),
    prisma.contact.count({ where: { phone: { not: null }, consentSms: true, unsubscribedAt: null } }),
    prisma.contact.findMany({
      where: { phone: { not: null } },
      select: { tags: true },
      take: 2000,
    }),
  ]);
  const tagSet = new Set<string>();
  for (const c of taggedContacts) for (const t of c.tags) tagSet.add(t);
  const tags = Array.from(tagSet).sort();

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-2">카카오 발송</h1>
      <p className="text-sm text-neutral-500 mb-6 max-w-xl">
        전화번호가 있는 컨택트에게 카카오 알림톡·친구톡을 보냅니다. 대상은 태그로 좁힐 수 있어요.
      </p>

      {!configured && (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 mb-6 max-w-xl">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            아직 Solapi 발송 설정이 완료되지 않았어요.{" "}
            <Link href="/admin/messaging-settings" className="font-bold underline">
              카카오·문자 발송 설정
            </Link>
            에서 API 키·발신번호·채널 pfId를 먼저 입력해 주세요.
          </p>
        </div>
      )}

      <KakaoSendClient tags={tags} phoneCount={phoneCount} consentCount={consentCount} />
    </div>
  );
}
