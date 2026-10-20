import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveLiveEvent, liveOpsChecklist, type LiveOpsInput } from "@/lib/live-ops";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;
  const body = (await req.json().catch(() => null)) as LiveOpsInput | null;
  if (!body?.title?.trim() || !body.startsAt) {
    return NextResponse.json({ error: "제목과 라이브 일시는 필수입니다." }, { status: 400 });
  }
  try {
    const { live, reseeded } = await saveLiveEvent({ ...body, title: body.title.trim() });
    const checklist = await liveOpsChecklist(live.id);
    return NextResponse.json({ live, reseeded, checklist });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "저장 실패" }, { status: 500 });
  }
}

export async function GET() {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;
  const lives = await prisma.liveEvent.findMany({ orderBy: { startsAt: "desc" }, take: 12, include: { cohort: true, campaign: true } });
  return NextResponse.json({ lives });
}
