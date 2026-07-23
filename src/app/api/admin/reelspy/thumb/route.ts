import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// 인스타 CDN 썸네일 프록시 (핫링크 차단·만료 회피). 어드민 세션만 허용.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const target = req.nextUrl.searchParams.get("url");
  if (!target || !/^https?:\/\//.test(target)) {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }
  // 인스타 CDN만 허용
  let host = "";
  try {
    host = new URL(target).hostname;
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }
  if (!/(cdninstagram\.com|fbcdn\.net|instagram\.com)$/.test(host)) {
    return NextResponse.json({ error: "host not allowed" }, { status: 400 });
  }

  try {
    const res = await fetch(target, {
      headers: { Referer: "https://www.instagram.com/", "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return NextResponse.json({ error: "fetch failed" }, { status: 502 });
    const buf = await res.arrayBuffer();
    return new NextResponse(buf, {
      headers: {
        "Content-Type": res.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "proxy error" }, { status: 502 });
  }
}
