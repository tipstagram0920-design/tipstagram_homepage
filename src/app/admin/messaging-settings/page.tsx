import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { MessagingSettingsClient } from "./MessagingSettingsClient";

export const dynamic = "force-dynamic";

export default async function MessagingSettingsPage() {
  // 시크릿(api key/secret)은 값을 그대로 노출하지 않고 "설정됨" 여부만 전달
  const apiKey = (await getSetting(SETTING_KEYS.solapiApiKey)) || "";
  const apiSecret = (await getSetting(SETTING_KEYS.solapiApiSecret)) || "";
  const sender = (await getSetting(SETTING_KEYS.solapiSenderNumber)) || "";
  const pfId = (await getSetting(SETTING_KEYS.solapiKakaoPfId)) || "";

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-2">카카오·문자 발송 설정</h1>
      <p className="text-sm text-neutral-500 mb-8 max-w-xl">
        카카오 알림톡·친구톡·문자(SMS) 발송에 쓰는 Solapi 연동 정보를 입력합니다. 저장하면 워크플로우와
        &quot;카카오 발송&quot; 화면에서 바로 사용됩니다.
      </p>
      <MessagingSettingsClient
        initial={{
          hasApiKey: !!apiKey,
          hasApiSecret: !!apiSecret,
          sender,
          pfId,
        }}
      />
    </div>
  );
}
