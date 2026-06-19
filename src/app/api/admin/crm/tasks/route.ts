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
  const tasks = await prisma.operatorTask.findMany({ orderBy: { scheduledAt: "asc" } });
  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;
  const body = await req.json();
  if (!body.title || !body.scheduledAt) {
    return NextResponse.json({ error: "title, scheduledAt 필요" }, { status: 400 });
  }
  const task = await prisma.operatorTask.create({
    data: {
      title: body.title,
      detail: body.detail ?? null,
      scheduledAt: new Date(body.scheduledAt),
    },
  });
  return NextResponse.json({ task });
}
