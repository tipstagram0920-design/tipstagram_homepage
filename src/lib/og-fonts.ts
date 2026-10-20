/**
 * OG/썸네일 렌더용 한글 폰트. 구글 폰트 CSS 에서 뽑는 방식은 satori 가 거절하는 바이트를 줘서
 * Pretendard OTF(OTTO) 를 CDN 에서 받아 모듈 캐시에 둔다(상세는 api/og/course 주석).
 */
const FONT_CDN = "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static";
let cache: { black: ArrayBuffer; bold: ArrayBuffer } | null = null;

export async function loadOgFonts() {
  if (cache) return cache;
  const [black, bold] = await Promise.all([
    fetch(`${FONT_CDN}/Pretendard-Black.otf`).then((r) => r.arrayBuffer()),
    fetch(`${FONT_CDN}/Pretendard-Bold.otf`).then((r) => r.arrayBuffer()),
  ]);
  cache = { black, bold };
  return cache;
}

export const ogFontList = (f: { black: ArrayBuffer; bold: ArrayBuffer }) => [
  { name: "Pretendard", data: f.black, weight: 900 as const, style: "normal" as const },
  { name: "Pretendard", data: f.bold, weight: 700 as const, style: "normal" as const },
];
