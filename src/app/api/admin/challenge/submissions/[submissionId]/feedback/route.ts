import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMessage } from "@/lib/messaging";
import { COMPANY } from "@/lib/company";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://tipstagram-homepage.vercel.app";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// 강사가 입력한 평문 피드백을 안전한 HTML로 변환 (줄바꿈 보존)
function textToHtml(text: string): string {
  return escapeHtml(text.trim())
    .split(/\n{2,}/)
    .map((para) => `<p>${para.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

/**
 * POST /api/admin/challenge/submissions/[submissionId]/feedback
 * 관리자가 특정 숙제 제출에 피드백을 작성·저장하고, 최초 저장 시 학생에게 이메일 1회 발송.
 * body: { feedbackText }
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
  if (!feedbackText) {
    return NextResponse.json({ error: "피드백 내용을 입력해 주세요." }, { status: 400 });
  }

  const submission = await prisma.homeworkSubmission.findUnique({
    where: { id: submissionId },
    include: {
      user: { select: { email: true, name: true, contactId: true } },
      week: { select: { weekIndex: true, cohortId: true, title: true } },
    },
  });
  if (!submission) {
    return NextResponse.json({ error: "제출을 찾을 수 없어요." }, { status: 404 });
  }

  const isFirst = !submission.feedbackAt;
  const feedbackHtml = textToHtml(feedbackText);

  await prisma.homeworkSubmission.update({
    where: { id: submissionId },
    data: {
      feedbackHtml,
      feedbackJson: { text: feedbackText },
      feedbackBy: adminId ?? null,
      feedbackAt: new Date(),
      status: "feedback_given",
    },
  });

  // 최초 피드백일 때만 이메일 1회 발송 (수정 시 중복 발송 방지)
  let emailed = false;
  if (isFirst && submission.user.email) {
    const weekLabel = `Week ${submission.week.weekIndex}`;
    const link = `${SITE}/challenge/${submission.week.cohortId}/week/${submission.week.weekIndex}`;
    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;color:#111">
        <p style="font-size:15px;line-height:1.7">안녕하세요, ${escapeHtml(submission.user.name || "회원")}님!</p>
        <p style="font-size:15px;line-height:1.7"><strong>${weekLabel} 숙제에 강사 피드백이 도착했어요.</strong> 아래 버튼을 눌러 확인해 주세요.</p>
        <div style="margin:24px 0">
          <a href="${link}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 22px;border-radius:12px;font-weight:700;font-size:14px">피드백 확인하기</a>
        </div>
        <p style="font-size:12px;color:#888;line-height:1.6">${COMPANY.serviceName} 5주 챌린지</p>
      </div>`;
    const res = await sendMessage({
      to: submission.user.email,
      subject: `[${COMPANY.serviceName}] ${weekLabel} 숙제 피드백이 도착했어요`,
      body: html,
      templateKey: "challenge_feedback",
      contactId: submission.user.contactId ?? undefined,
      transactional: true,
    });
    emailed = res.ok;
  }

  return NextResponse.json({ ok: true, emailed, isFirst });
}
