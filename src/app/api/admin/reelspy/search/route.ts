import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchReels } from "@/lib/reelspy";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") || undefined;
  const category = sp.get("category") || undefined;
  const limit = Number(sp.get("limit")) || 12;

  const result = await searchReels({ q, category, limit });
  return NextResponse.json(result);
}
