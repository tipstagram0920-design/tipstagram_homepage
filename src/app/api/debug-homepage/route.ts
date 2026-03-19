import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const blocks = await prisma.homepageBlock.findMany({
      orderBy: [{ section: "asc" }, { order: "asc" }],
    });
    return NextResponse.json({ ok: true, count: blocks.length, blocks });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
