import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { CheckoutSettingsClient } from "./CheckoutSettingsClient";

export const dynamic = "force-dynamic";

export default async function CheckoutSettingsPage() {
  const externalCheckoutUrl = (await getSetting(SETTING_KEYS.externalCheckoutUrl)) || "";

  return (
    <div>
      <h1 className="text-2xl font-black text-neutral-900 mb-2">결제 설정</h1>
      <p className="text-sm text-neutral-500 mb-8">
        결제를 외부 사이트에서 받는 경우, 외부 결제 URL을 입력하세요. 비어 있으면 내부 토스 결제 흐름이 작동합니다.
      </p>
      <CheckoutSettingsClient initial={{ externalCheckoutUrl }} />
    </div>
  );
}
