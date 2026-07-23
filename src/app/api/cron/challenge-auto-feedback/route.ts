import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { feedbackTextToHtml } from "@/lib/challenge-feedback";
import { generateFeedbackText, isAiFeedbackConfigured } from "@/lib/challenge-ai-feedback";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // AI 호출이 있어 여유롭게

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // 미설정 시 허용(개발). 운영에선 설정 권장.
  return auth === `Bearer ${secret}`;
}

// 제출 30분 경과 & 아직 피드백(초안 포함)이 없는 정식 제출을 찾아 AI 피드백 초안을 생성.
// 초안은 feedbackAt을 설정하지 않음 → 학생에게 안 보이고, 어드민이 검토 후 '전송'해야 발송됨.
const DELAY_MS = 30 * 60 * 1000; // 30분
const MAX_PER_RUN = 8; // 회당 처리량(비용·시간 제한)

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAiFeedbackConfigured()) {
    return NextResponse.json({ ok: true, skipped: "ANTHROPIC_API_KEY 미설정" });
  }

  const cutoff = new Date(Date.now() - DELAY_MS);
  const targets = await prisma.homeworkSubmission.findMany({
    where: {
      status: "submitted", // 정식 제출(draft·이미 피드백 제외)
      feedbackAt: null, // 아직 발송 안 됨
      feedbackHtml: null, // 초안도 아직 없음
      submittedAt: { lte: cutoff }, // 제출 30분 경과
    },
    orderBy: { submittedAt: "asc" },
    take: MAX_PER_RUN,
    include: {
      user: { select: { name: true } },
      week: { select: { weekIndex: true, title: true } },
    },
  });

  let generated = 0;
  for (const s of targets) {
    const text = await generateFeedbackText({
      weekIndex: s.week.weekIndex,
      weekTitle: s.week.title,
      studentName: s.user.name,
      content: s.content,
    });
    if (!text) continue;
    await prisma.homeworkSubmission.update({
      where: { id: s.id },
      data: {
        feedbackHtml: feedbackTextToHtml(text),
        feedbackJson: { text, auto: true },
        feedbackBy: "ai-auto",
        // feedbackAt은 설정하지 않음 → 초안(미발송). status도 그대로 submitted.
      },
    });
    generated++;
  }

  return NextResponse.json({ ok: true, candidates: targets.length, generated });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
