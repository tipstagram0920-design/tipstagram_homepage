import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { feedbackTextToHtml, sendFeedbackEmail } from "@/lib/challenge-feedback";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/challenge/submissions/[submissionId]/feedback
 * 관리자가 특정 숙제 제출에 피드백을 작성한다.
 * body: { feedbackText, send? }
 *  - send=false(기본): 임시 저장만. 학생에게 보이지 않음(feedbackAt 미설정), 이메일 없음.
 *  - send=true: 학생에게 공개(feedbackAt 설정) + 최초 1회 이메일 발송.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const session = await auth();
  const adminId = (session?.user as { id?: string; role?: string })?.id;
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { submissionId } = await params;
  const body = await req.json().catch(() => ({}));
  const feedbackText = typeof body.feedbackText === "string" ? body.feedbackText.trim() : "";
  const send = body.send === true;
  if (!feedbackText) {
    return NextResponse.json({ error: "피드백 내용을 입력해 주세요." }, { status: 400 });
  }

  const submission = await prisma.homeworkSubmission.findUnique({
    where: { id: submissionId },
    include: {
      user: { select: { email: true, name: true, contactId: true } },
      week: { select: { weekIndex: true, cohortId: true } },
    },
  });
  if (!submission) {
    return NextResponse.json({ error: "제출을 찾을 수 없어요." }, { status: 404 });
  }

  const feedbackHtml = feedbackTextToHtml(feedbackText);
  const willSendEmail = send && !submission.feedbackAt; // 최초 전송 시에만 이메일

  await prisma.homeworkSubmission.update({
    where: { id: submissionId },
    data: {
      feedbackHtml,
      feedbackJson: { text: feedbackText },
      feedbackBy: adminId ?? null,
      // 전송할 때만 학생에게 공개(feedbackAt) + 상태 변경. 저장만이면 건드리지 않음.
      ...(send
        ? { feedbackAt: submission.feedbackAt ?? new Date(), status: "feedback_given" }
        : {}),
    },
  });

  let emailed = false;
  if (willSendEmail) {
    emailed = await sendFeedbackEmail({
      email: submission.user.email,
      name: submission.user.name,
      contactId: submission.user.contactId,
      weekIndex: submission.week.weekIndex,
      cohortId: submission.week.cohortId,
      feedbackHtml,
    });
  }

  return NextResponse.json({ ok: true, sent: send, emailed });
}
