import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

// Week 2 "바이럴 후킹 50선" 레퍼런스 페이지를 text/html로 서빙.
// HTML 본문은 settings("week2_hooks_html")에 저장돼 있음(자립형: 인라인 CSS + data-URI 썸네일).
export async function GET() {
  const html = await getSetting("week2_hooks_html");
  if (!html) {
    return new NextResponse("자료가 아직 준비되지 않았어요.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
