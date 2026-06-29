import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { Prisma } from "@prisma/client";

const SESSION_COOKIE = "_tg_sid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
const BOT_RE = /bot|crawler|spider|crawling|preview|googlebot|bingbot/i;

function newSessionId() {
  return "s_" + randomBytes(12).toString("hex");
}

export async function POST(req: NextRequest) {
  let body: {
    type?: string;
    path?: string;
    referrer?: string;
    utm?: Record<string, string | undefined>;
    props?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const type = String(body.type || "").slice(0, 64);
  const path = String(body.path || "").slice(0, 512);
  if (!type || !path) {
    return NextResponse.json({ error: "type/path required" }, { status: 400 });
  }

  const ua = req.headers.get("user-agent") || "";
  if (BOT_RE.test(ua)) {
    return NextResponse.json({ ok: true, skipped: "bot" });
  }

  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    null;

  let sid = req.cookies.get(SESSION_COOKIE)?.value;
  let setCookie = false;
  if (!sid) {
    sid = newSessionId();
    setCookie = true;
  }

  await prisma.trackEvent.create({
    data: {
      sessionId: sid,
      type,
      path,
      referrer: body.referrer?.slice(0, 512) || null,
      utmSource: body.utm?.source?.slice(0, 128) || null,
      utmMedium: body.utm?.medium?.slice(0, 128) || null,
      utmCampaign: body.utm?.campaign?.slice(0, 128) || null,
      utmTerm: body.utm?.term?.slice(0, 128) || null,
      utmContent: body.utm?.content?.slice(0, 128) || null,
      country,
      userAgent: ua.slice(0, 512),
      props: body.props
        ? (body.props as Prisma.InputJsonValue)
        : Prisma.JsonNull,
    },
  });

  const res = NextResponse.json({ ok: true, sid });
  if (setCookie) {
    res.cookies.set(SESSION_COOKIE, sid, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });
  }
  return res;
}
