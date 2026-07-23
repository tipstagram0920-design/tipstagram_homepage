import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/challenge/submissions/[submissionId]
 * 모달 미리보기용 단일 제출 상세(숙제 + 피드백) 데이터.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const session = await auth();
  if (((session?.user as { role?: string })?.role) !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { submissionId } = await params;
  const s = await prisma.homeworkSubmission.findUnique({
    where: { id: submissionId },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!s) return NextResponse.json({ error: "제출을 찾을 수 없어요." }, { status: 404 });

  const feedbackText =
    s.feedbackJson && typeof s.feedbackJson === "object" && "text" in s.feedbackJson
      ? String((s.feedbackJson as { text?: unknown }).text ?? "")
      : "";
  const isAuto =
    !s.feedbackAt &&
    !!s.feedbackJson &&
    typeof s.feedbackJson === "object" &&
    "auto" in s.feedbackJson &&
    !!(s.feedbackJson as { auto?: unknown }).auto;

  return NextResponse.json({
    id: s.id,
    userName: s.user.name,
    userEmail: s.user.email,
    content: s.content,
    formData: s.formData,
    imageUrls: s.imageUrls,
    instagramUrl: s.instagramUrl,
    submittedAt: s.submittedAt.toISOString(),
    status: s.status,
    feedbackAt: s.feedbackAt ? s.feedbackAt.toISOString() : null,
    feedbackText,
    isAuto,
    hasDraft: !s.feedbackAt && !!s.feedbackHtml,
  });
}
