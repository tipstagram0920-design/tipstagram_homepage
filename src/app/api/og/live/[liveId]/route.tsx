import { ImageResponse } from "next/og";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { loadOgFonts, ogFontList } from "@/lib/og-fonts";
import { formatLive } from "@/lib/challenge-schedule";

export const runtime = "nodejs";

/**
 * 라이브 예고 카드 (인스타 4:5 · 1080×1350) — `?d=7` 처럼 D-n 을 받아 그린다.
 *
 * 왜 JPEG 인가: SNS automation 인입이 HEAD 로 image/jpeg 를 확인한다(인스타가 PNG 를 불안정하게 받는다).
 * next/og 는 PNG 만 내므로 sharp 로 바꿔 돌려준다. 호출은 인입 검사 1회 + 인스타 컨테이너 생성 1회뿐이다.
 */
export async function GET(req: Request, { params }: { params: Promise<{ liveId: string }> }) {
  const { liveId } = await params;
  const d = Math.max(0, Math.min(30, Number(new URL(req.url).searchParams.get("d") ?? "0") || 0));
  const live = await prisma.liveEvent.findUnique({ where: { id: liveId }, select: { title: true, startsAt: true } });
  if (!live) return new Response("not found", { status: 404 });

  const fonts = await loadOgFonts();
  const dLabel = d === 0 ? "D-DAY" : `D-${d}`;
  const when = formatLive(live.startsAt); // "11월 5일 (목) 저녁 8시"
  const accent = d === 0 ? "#FB7185" : d <= 2 ? "#FBBF24" : "#C084FC";
  const glow = d === 0 ? "#9F1239" : d <= 2 ? "#B45309" : "#6B21A8";

  const png = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0A0A0A", position: "relative", fontFamily: "Pretendard" }}>
        <div style={{ position: "absolute", top: -260, right: -240, width: 900, height: 900, background: `radial-gradient(circle at center, ${glow} 0%, ${glow}00 68%)` }} />
        <div style={{ position: "absolute", bottom: -380, left: -200, width: 820, height: 820, background: `radial-gradient(circle at center, ${glow}99 0%, ${glow}00 65%)` }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: 72 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 14, height: 14, borderRadius: 999, background: "#F87171" }} />
              <div style={{ fontSize: 30, letterSpacing: 6, color: "#FFFFFF", opacity: 0.7 }}>TIPSTAGRAM · FREE LIVE</div>
            </div>
            <div style={{ marginTop: 56, fontSize: 220, lineHeight: 1, color: accent, letterSpacing: -6 }}>{dLabel}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 68, lineHeight: 1.18, color: "#FFFFFF", maxWidth: 920 }}>{live.title}</div>
            <div style={{ marginTop: 28, fontSize: 40, fontWeight: 700, color: "#FFFFFF", opacity: 0.8 }}>{`${when} · 유튜브 라이브`}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", background: accent, color: "#0A0A0A", fontSize: 36, padding: "22px 40px", borderRadius: 20 }}>
              {d === 0 ? "오늘 저녁, 프로필 링크에서 입장" : "신청은 프로필 링크에서"}
            </div>
            <div style={{ fontSize: 28, color: "#FFFFFF", opacity: 0.4 }}>@tipstagram2023</div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350, fonts: ogFontList(fonts) }
  );
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer())).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": String(jpeg.length),
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
