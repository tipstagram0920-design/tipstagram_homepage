/**
 * 클라이언트 측 이벤트 트래커 헬퍼.
 * - track(type, props?) — 즉시 1건 POST
 * - extractUtm() — URL 쿼리에서 utm_* 추출 (없으면 sessionStorage 캐시 사용)
 */

const UTM_KEYS = ["source", "medium", "campaign", "term", "content"] as const;
const UTM_STORAGE_KEY = "_tg_utm";

export function extractUtm(): Record<string, string | undefined> {
  if (typeof window === "undefined") return {};
  const url = new URL(window.location.href);
  const fromUrl: Record<string, string | undefined> = {};
  let hasAny = false;
  for (const k of UTM_KEYS) {
    const v = url.searchParams.get("utm_" + k);
    if (v) {
      fromUrl[k] = v;
      hasAny = true;
    }
  }
  if (hasAny) {
    try {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(fromUrl));
    } catch {}
    return fromUrl;
  }
  try {
    const cached = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (cached) return JSON.parse(cached) as Record<string, string | undefined>;
  } catch {}
  return {};
}

export async function track(
  type: string,
  props?: Record<string, unknown>
): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        type,
        path: window.location.pathname,
        referrer: document.referrer || undefined,
        utm: extractUtm(),
        props,
      }),
    });
  } catch {
    // silent
  }
}
