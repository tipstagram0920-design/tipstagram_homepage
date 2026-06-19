import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { seedOperatorTasksForCampaign } from "@/lib/crm/operator-tasks";

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
  const campaigns = await prisma.webinarCampaign.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { sends: true } } },
  });
  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;
  const body = await req.json();
  if (!body.name || !body.webinarDate) {
    return NextResponse.json({ error: "name, webinarDate 필요" }, { status: 400 });
  }
  const campaign = await prisma.webinarCampaign.create({
    data: {
      name: body.name,
      webinarDate: new Date(body.webinarDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      audience: body.audience ?? {},
      steps: body.steps ?? [],
      isActive: !!body.isActive,
      skipPast: !!body.skipPast,
    },
  });
  // 운영 task 자동 시드 (옵션)
  let seededTasks = 0;
  if (body.seedOperatorTasks) {
    seededTasks = await seedOperatorTasksForCampaign(
      campaign.id,
      campaign.webinarDate,
      campaign.endDate
    );
  }
  return NextResponse.json({ campaign, seededTasks });
}
