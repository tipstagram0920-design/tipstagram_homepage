import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { LiveSettingsClient } from "./LiveSettingsClient";

export default async function LiveSettingsPage() {
  const kakaoChatUrl = (await getSetting(SETTING_KEYS.kakaoChatUrl)) || "";
  const ebookUrl = (await getSetting(SETTING_KEYS.ebookUrl)) || "";

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-2">라이브 설정</h1>
      <p className="text-sm text-neutral-500 mb-8">
        무료 라이브 신청자에게 자동 발송되는 메일의 링크들을 관리합니다.
      </p>
      <LiveSettingsClient initial={{ kakaoChatUrl, ebookUrl }} />
    </div>
  );
}
