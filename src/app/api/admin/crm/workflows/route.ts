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

  const workflows = await prisma.workflow.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { runs: true } } },
  });
  return NextResponse.json({ workflows });
}

export async function POST(req: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  const body = await req.json();
  const workflow = await prisma.workflow.create({
    data: {
      name: body.name || "이름 없음",
      trigger: body.trigger || "live_signup",
      conditions: body.conditions ?? undefined,
      steps: body.steps ?? [],
      isActive: !!body.isActive,
    },
  });
  return NextResponse.json({ workflow });
}
