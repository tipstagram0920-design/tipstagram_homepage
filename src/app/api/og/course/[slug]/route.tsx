import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * 강의 썸네일을 DB 값으로 그린다.
 *
 * 왜 동적인가: 예전 썸네일은 가격이 **이미지에 박힌 정적 PNG** 라, 컨설팅을 330만원으로 올렸을 때
 * 카드에는 300만원이 남아 있었다(2026-08-24). 값이 바뀌면 그림도 따라오게 만든다.
 */

/** 상품군별 색·라벨. 새 상품이 늘면 여기만 추가한다. */
const TIERS: Record<string, { label: string; accent: string; glow: string; note?: string }> = {
  "marketing-booster": { label: "TIPSTAGRAM · COURSE", accent: "#FBBF24", glow: "#B45309" },
  "5-week-challenge": { label: "TIPSTAGRAM · CHALLENGE", accent: "#FB7185", glow: "#9F1239", note: "10명 한정" },
  "5-week-challenge-plus-consulting": { label: "TIPSTAGRAM · PREMIUM", accent: "#C084FC", glow: "#6B21A8", note: "프리미엄" },
};
const FALLBACK = { label: "TIPSTAGRAM", accent: "#FB7185", glow: "#9F1239" };

/**
 * 한글 글리프가 있는 폰트를 실어야 한다. 없으면 전부 두부(□)로 나온다.
 *
 * 구글 폰트 CSS 에서 뽑아 쓰는 흔한 방법은 여기서 안 됐다 — 받아지는 바이트가 TTF 가 아니라
 * satori 가 "Unsupported OpenType signature" 로 거절한다. Pretendard 는 OTF(OTTO) 를 그대로 준다.
 */
const FONT_CDN = "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static";
let fontCache: { black: ArrayBuffer; bold: ArrayBuffer } | null = null;
async function loadFonts() {
  if (fontCache) return fontCache;
  const [black, bold] = await Promise.all([
    fetch(`${FONT_CDN}/Pretendard-Black.otf`).then((r) => r.arrayBuffer()),
    fetch(`${FONT_CDN}/Pretendard-Bold.otf`).then((r) => r.arrayBuffer()),
  ]);
  fontCache = { black, bold };
  return fontCache;
}

/** 950000 → "95만원", 3300000 → "330만원" */
function manwon(price: number): string {
  const man = Math.round(price / 10000);
  return `${man.toLocaleString("ko-KR")}만원`;
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { title: true, subtitle: true, price: true },
  });
  if (!product) return new Response("not found", { status: 404 });

  const tier = TIERS[slug] ?? FALLBACK;
  const fonts = await loadFonts();

  // 제목 마지막 낱말만 색을 준다 — 한 줄로 흘리는 것보다 눈이 먼저 붙는다
  const words = product.title.split(" ");
  const head = words.length > 1 ? words.slice(0, -1).join(" ") : "";
  const tail = words[words.length - 1];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 40,
          background: "#0A0A0A",
          padding: 64,
          position: "relative",
          fontFamily: "Pretendard",
        }}
      >
        {/* 은은한 광원 두 개 — 평평한 검정을 깨준다.
            satori 는 filter:blur 를 무시해서 원을 그리면 테두리가 칼같이 선다 →
            radial-gradient 로 가장자리를 직접 흐린다. */}
        <div
          style={{
            position: "absolute",
            top: -260,
            right: -220,
            width: 900,
            height: 900,
            background: `radial-gradient(circle at center, ${tier.glow} 0%, ${tier.glow}00 68%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -340,
            left: -180,
            width: 760,
            height: 760,
            background: `radial-gradient(circle at center, ${tier.glow}99 0%, ${tier.glow}00 65%)`,
          }}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ width: 84, height: 7, borderRadius: 999, background: tier.accent }} />
          <div
            style={{
              marginTop: 26,
              fontSize: 27,
              letterSpacing: 5,
              color: "#FFFFFF",
              opacity: 0.65,
            }}
          >
            {tier.label}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", marginBottom: 8 }}>
          <div style={{ display: "flex", flexWrap: "wrap", fontSize: 92, lineHeight: 1.12 }}>
            {head && <span style={{ color: "#FFFFFF", marginRight: 22 }}>{head}</span>}
            <span style={{ color: tier.accent }}>{tail}</span>
          </div>
          {product.subtitle && (
            <div style={{ marginTop: 26, fontSize: 31, fontWeight: 700, color: "#FFFFFF", opacity: 0.62 }}>
              {product.subtitle}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: tier.accent,
              color: "#0A0A0A",
              fontSize: 34,
              padding: "18px 34px",
              borderRadius: 18,
            }}
          >
            {manwon(product.price)}
            {tier.note ? ` · ${tier.note}` : ""}
          </div>
          <div style={{ fontSize: 26, color: "#FFFFFF", opacity: 0.4 }}>팁스타그램</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 900,
      fonts: [
        { name: "Pretendard", data: fonts.black, weight: 900, style: "normal" as const },
        { name: "Pretendard", data: fonts.bold, weight: 700, style: "normal" as const },
      ],
      headers: { "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=86400" },
    }
  );
}
