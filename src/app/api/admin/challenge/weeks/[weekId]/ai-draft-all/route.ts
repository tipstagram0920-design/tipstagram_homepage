import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { feedbackTextToHtml } from "@/lib/challenge-feedback";
import { generateFeedbackText, isAiFeedbackConfigured } from "@/lib/challenge-ai-feedback";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_PER_RUN = 25; // 한 번에 처리할 최대 제출 수(타임아웃 방지)

/**
 * POST /api/admin/challenge/weeks/[weekId]/ai-draft-all
 * 이번 주의 '정식 제출 & 아직 미발송' 건에 대해 AI 피드백 초안을 (재)생성한다.
 * - 이미 학생에게 전송된 건(feedbackAt 있음)은 건드리지 않음.
 * - 결과는 미발송 초안으로 저장.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ weekId: string }> }
) {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!isAiFeedbackConfigured()) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY가 설정되지 않았어요." }, { status: 400 });
  }

  const { weekId } = await params;
  const week = await prisma.challengeWeek.findUnique({
    where: { id: weekId },
    select: { weekIndex: true, title: true, homeworkPrompt: true, description: true },
  });
  if (!week) return NextResponse.json({ error: "주차를 찾을 수 없어요." }, { status: 404 });

  const targets = await prisma.homeworkSubmission.findMany({
    where: { weekId, status: "submitted", feedbackAt: null }, // 정식 제출 & 미발송
    orderBy: { submittedAt: "asc" },
    take: MAX_PER_RUN,
    include: { user: { select: { name: true } } },
  });

  let generated = 0;
  let failed = 0;
  for (const s of targets) {
    const text = await generateFeedbackText({
      weekIndex: week.weekIndex,
      weekTitle: week.title,
      weekContext: week.homeworkPrompt || week.description || null,
      studentName: s.user.name,
      content: s.content,
      formData: s.formData,
    });
    if (!text) {
      failed++;
      continue;
    }
    await prisma.homeworkSubmission.update({
      where: { id: s.id },
      data: {
        feedbackHtml: feedbackTextToHtml(text),
        feedbackJson: { text, auto: true },
        feedbackBy: "ai-auto",
      },
    });
    generated++;
  }

  return NextResponse.json({ ok: true, total: targets.length, generated, failed });
}
