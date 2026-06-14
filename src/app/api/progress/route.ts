import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/crm/events";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId, completed } = await req.json();

  const existing = await prisma.progress.findUnique({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
  }).catch(() => null);

  const progress = await prisma.progress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    update: { completed },
    create: { userId: session.user.id, lessonId, completed },
  });

  // 완강 신규 토글 시만 이벤트 기록
  if (completed && !existing?.completed) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { contactId: true },
    });
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { title: true },
    });
    if (user?.contactId) {
      await logEvent(user.contactId, "lesson_complete", {
        lessonId,
        lessonTitle: lesson?.title,
      });
    }
  }

  return NextResponse.json(progress);
}
