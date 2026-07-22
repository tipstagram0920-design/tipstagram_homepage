import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendFeedbackEmail } from "@/lib/challenge-feedback";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/challenge/weeks/[weekId]/send-feedback
 * 이 주차에서 '저장만 되고 아직 미발송'인 피드백을 일괄 전송(학생 공개 + 이메일).
 * 저장된 피드백(feedbackHtml 있음) 중 feedbackAt이 없는 건만 대상.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ weekId: string }> }
) {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { weekId } = await params;

  const targets = await prisma.homeworkSubmission.findMany({
    where: { weekId, feedbackAt: null, feedbackHtml: { not: null } },
    include: {
      user: { select: { email: true, name: true, contactId: true } },
      week: { select: { weekIndex: true, cohortId: true } },
    },
  });

  let sent = 0;
  let emailed = 0;
  for (const s of targets) {
    await prisma.homeworkSubmission.update({
      where: { id: s.id },
      data: { feedbackAt: new Date(), status: "feedback_given" },
    });
    sent++;
    const ok = await sendFeedbackEmail({
      email: s.user.email,
      name: s.user.name,
      contactId: s.user.contactId,
      weekIndex: s.week.weekIndex,
      cohortId: s.week.cohortId,
    });
    if (ok) emailed++;
  }

  return NextResponse.json({ ok: true, sent, emailed });
}
