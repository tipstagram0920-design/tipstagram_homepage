import { signWebhookBody } from "@/lib/external-purchase";

/**
 * 팁스킷 live_events 동기화.
 *
 * 팁스킷 /live 와 메타 광고 랜딩(tipstagram-webinar.vercel.app)은 팁스킷 live_events 를 읽는다.
 * 홈페이지가 원본이 됐으니 저장할 때마다 밀어넣는다. 인증은 결제 웹훅과 같은 HMAC(EXTERNAL_PURCHASE_SECRET).
 * 실패해도 저장은 성공으로 두고 사유만 돌려준다 — 랜딩 하나 때문에 캠페인까지 막히면 안 된다.
 */
export async function syncLiveToTipskit(input: {
  slug: string;
  title: string;
  startsAt: Date;
  chatUrl: string | null;
  visible: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const base = (process.env.TIPSKIT_SITE_URL || "https://tipskit.co.kr").replace(/\/$/, "");
  const body = JSON.stringify({
    slug: input.slug,
    title: input.title,
    startsAt: input.startsAt.toISOString(),
    openchatUrl: input.chatUrl,
    visible: input.visible,
  });
  try {
    const res = await fetch(`${base}/api/live/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-signature": signWebhookBody(body) },
      body,
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}: ${(await res.text()).slice(0, 160)}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network" };
  }
}
