/**
 * 강의 영상 소스 파싱.
 * DB의 `Lesson.vimeoId` 필드는 역사적으로 Vimeo ID만 담았지만,
 * 이제 YouTube URL / YouTube ID / Vimeo URL / Vimeo ID 어느 형태든 저장 가능.
 * 렌더 시점에 본 모듈에서 provider를 판별한다.
 */

export type VideoProvider = "vimeo" | "youtube";

export interface ParsedVideo {
  provider: VideoProvider;
  id: string;
}

export function parseVideoSource(
  input: string | null | undefined
): ParsedVideo | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  const yt = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (yt) return { provider: "youtube", id: yt[1] };

  const vm = trimmed.match(
    /vimeo\.com\/(?:video\/|channels\/[^/]+\/|groups\/[^/]+\/videos\/)?(\d+)/
  );
  if (vm) return { provider: "vimeo", id: vm[1] };

  if (/^\d{6,}$/.test(trimmed)) return { provider: "vimeo", id: trimmed };
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return { provider: "youtube", id: trimmed };

  return null;
}

export function getEmbedUrl(
  parsed: ParsedVideo,
  opts: { autoplay?: boolean } = {}
): string {
  const { autoplay = false } = opts;

  if (parsed.provider === "youtube") {
    const params = new URLSearchParams({
      ...(autoplay ? { autoplay: "1" } : {}),
      rel: "0",
      modestbranding: "1",
      controls: "1",
      playsinline: "1",
    });
    return `https://www.youtube.com/embed/${parsed.id}?${params.toString()}`;
  }

  const params = new URLSearchParams({
    ...(autoplay ? { autoplay: "1" } : {}),
    color: "e1306c",
    title: "0",
    byline: "0",
    portrait: "0",
  });
  return `https://player.vimeo.com/video/${parsed.id}?${params.toString()}`;
}

/**
 * 어드민 입력값을 저장용으로 정규화.
 * Vimeo URL → 숫자 ID만. 그 외(YouTube URL/ID, 이미 Vimeo ID)는 원형 유지.
 * 인식 불가한 입력은 빈 문자열 반환(저장 차단).
 */
export function normalizeVideoInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const parsed = parseVideoSource(trimmed);
  if (!parsed) return trimmed; // 사용자가 보고 고칠 수 있게 원본 유지
  if (parsed.provider === "vimeo") return parsed.id;
  return trimmed; // YouTube는 URL 또는 ID 어느 형태든 그대로
}
