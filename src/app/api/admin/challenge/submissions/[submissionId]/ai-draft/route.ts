import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { feedbackTextToHtml } from "@/lib/challenge-feedback";
import { generateFeedbackText, isAiFeedbackConfigured } from "@/lib/challenge-ai-feedback";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * POST /api/admin/challenge/submissions/[submissionId]/ai-draft
 * 관리자가 특정 제출에 대해 AI 피드백 초안을 (재)생성한다.
 * - 이미 학생에게 전송된 피드백(feedbackAt 있음)은 덮어쓰지 않음.
 * - 생성 결과는 미발송 초안으로 저장하고, 본문 텍스트를 반환한다.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!isAiFeedbackConfigured()) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY가 설정되지 않았어요." }, { status: 400 });
  }

  const { submissionId } = await params;
  const submission = await prisma.homeworkSubmission.findUnique({
    where: { id: submissionId },
    include: {
      user: { select: { name: true } },
      week: { select: { weekIndex: true, title: true, homeworkPrompt: true, description: true } },
    },
  });
  if (!submission) {
    return NextResponse.json({ error: "제출을 찾을 수 없어요." }, { status: 404 });
  }
  if (submission.feedbackAt) {
    return NextResponse.json(
      { error: "이미 전송된 피드백이에요. 재생성하려면 내용을 직접 수정해 주세요." },
      { status: 400 }
    );
  }

  const text = await generateFeedbackText({
    weekIndex: submission.week.weekIndex,
    weekTitle: submission.week.title,
    weekContext: submission.week.homeworkPrompt || submission.week.description || null,
    studentName: submission.user.name,
    content: submission.content,
    formData: submission.formData,
  });
  if (!text) {
    return NextResponse.json({ error: "AI 생성에 실패했어요. 잠시 후 다시 시도해 주세요." }, { status: 502 });
  }

  await prisma.homeworkSubmission.update({
    where: { id: submissionId },
    data: {
      feedbackHtml: feedbackTextToHtml(text),
      feedbackJson: { text, auto: true },
      feedbackBy: "ai-auto",
      // feedbackAt 미설정 → 미발송 초안 유지
    },
  });

  return NextResponse.json({ ok: true, text });
}
