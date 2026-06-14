import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  const drafts = await prisma.broadcastDraft.findMany({
    orderBy: { scheduledAt: "asc" },
  });
  return NextResponse.json({ drafts });
}

export async function POST(req: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  const body = await req.json();
  if (!body.title || !body.body || !body.scheduledAt) {
    return NextResponse.json({ error: "title, body, scheduledAt 필요" }, { status: 400 });
  }
  const draft = await prisma.broadcastDraft.create({
    data: {
      channel: body.channel || "openchat",
      title: body.title,
      body: body.body,
      scheduledAt: new Date(body.scheduledAt),
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json({ draft });
}
