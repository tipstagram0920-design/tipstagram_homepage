import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { setSetting } from "@/lib/settings";
import { CONSULTING_PASSWORD_KEY } from "@/lib/consulting";

export const dynamic = "force-dynamic";

/**
 * PUT /api/admin/consulting — 컨설팅 공용 입장 비밀번호 설정.
 * body: { accessPassword }
 */
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const pw = typeof body.accessPassword === "string" ? body.accessPassword.trim() : "";
  await setSetting(CONSULTING_PASSWORD_KEY, pw);
  return NextResponse.json({ ok: true });
}
