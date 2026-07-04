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
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://tipstagram-homepage.vercel.app";
  // Zoom 초대장 텍스트가 통째로 들어와도 첫 URL만 추출
  const extractFirstUrl = (v: string | null | undefined): string | null => {
    if (!v) return null;
    const m = v.match(/https?:\/\/\S+/);
    return m ? m[0] : v.trim() || null;
  };
  const created = await prisma.webinarCampaign.create({
    data: {
      name: body.name,
      webinarDate: new Date(body.webinarDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      zoomUrl: extractFirstUrl(body.zoomUrl),
      salesUrl: extractFirstUrl(body.salesUrl),
      preQuestionUrl: extractFirstUrl(body.preQuestionUrl),
      kakaoChatUrl: extractFirstUrl(body.kakaoChatUrl),
      replayUrl: extractFirstUrl(body.replayUrl),
      audience: body.audience ?? {},
      steps: body.steps ?? [],
      isActive: !!body.isActive,
      skipPast: !!body.skipPast,
    },
  });
  // 사전 질문 페이지 URL이 지정되지 않았으면 자체 페이지 경로로 자동 채움
  const campaign = created.preQuestionUrl
    ? created
    : await prisma.webinarCampaign.update({
        where: { id: created.id },
        data: { preQuestionUrl: `${SITE}/webinar/ask/${created.id}` },
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
