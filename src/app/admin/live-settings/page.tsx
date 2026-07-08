import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { LiveSettingsClient } from "./LiveSettingsClient";

export const dynamic = "force-dynamic";

export default async function LiveSettingsPage() {
  const kakaoChatUrl = (await getSetting(SETTING_KEYS.kakaoChatUrl)) || "";
  const ebookUrl = (await getSetting(SETTING_KEYS.ebookUrl)) || "";
  const ebook1Url = (await getSetting(SETTING_KEYS.ebook1Url)) || "";
  const ebook2Url = (await getSetting(SETTING_KEYS.ebook2Url)) || "";
  const ebook2VerifyTag = (await getSetting(SETTING_KEYS.ebook2VerifyTag)) || "@tipstagram2023";
  const webinarSummaryUrl = (await getSetting(SETTING_KEYS.webinarSummaryUrl)) || "";

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-2">라이브 / 전자책 설정</h1>
      <p className="text-sm text-neutral-500 mb-8">
        무료 라이브·전자책·강의 요약본 신청자에게 자동 발송되는 메일의 링크들을 관리합니다.
      </p>
      <LiveSettingsClient
        initial={{ kakaoChatUrl, ebookUrl, ebook1Url, ebook2Url, ebook2VerifyTag, webinarSummaryUrl }}
      />
    </div>
  );
}
