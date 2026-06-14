import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { setSetting } from "@/lib/settings";

async function requireAdmin() {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function PUT(req: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  let body: { key?: string; value?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const key = body.key?.trim();
  const value = body.value ?? "";
  if (!key) return NextResponse.json({ error: "key가 필요합니다." }, { status: 400 });

  await setSetting(key, value);
  return NextResponse.json({ ok: true });
}
