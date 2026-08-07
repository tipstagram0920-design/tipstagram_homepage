import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getConsultingPassword, CONSULTING_DURATION_DAYS, currentDayIndex, getConsultingRefVideoMap } from "@/lib/consulting";
import type { RefVideo } from "@/components/consulting/TaskBoard";
import { TaskBoard, type BoardTask } from "@/components/consulting/TaskBoard";
import { PasswordGate } from "./_components/PasswordGate";
import { Sparkles, CalendarDays, BookOpen } from "lucide-react";
import { formatKstHuman } from "@/lib/kst";

export const dynamic = "force-dynamic";

export default async function ConsultingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?redirect=/consulting");

  const enrollment = await prisma.consultingEnrollment.findUnique({
    where: { userId: session.user.id },
    include: { tasks: { orderBy: [{ day: "asc" }, { order: "asc" }] } },
  });

  // 미등록 → 비밀번호 입장 화면 (비번 미설정이면 준비중 안내)
  if (!enrollment) {
    const password = await getConsultingPassword();
    return (
      <>
        <Navbar />
        <main className="relative min-h-screen bg-gradient-to-b from-neutral-100 via-neutral-50 to-white text-neutral-900">
          <div className="max-w-md mx-auto px-4 sm:px-6 pt-32 pb-24">
            {password ? (
              <PasswordGate />
            ) : (
              <div className="rounded-3xl bg-white border border-neutral-200/70 p-10 text-center">
                <Sparkles className="w-10 h-10 text-neutral-300 mx-auto mb-4" />
                <h1 className="text-lg font-black text-neutral-900 mb-2">
                  아직 컨설팅 프로그램이 열리지 않았어요
                </h1>
                <p className="text-sm text-neutral-500">준비되면 안내드릴게요.</p>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const tasks: BoardTask[] = enrollment.tasks.map((t) => ({
    id: t.id,
    day: t.day,
    endDay: t.endDay,
    order: t.order,
    title: t.title,
    description: t.description,
    doneAt: t.doneAt ? t.doneAt.toISOString() : null,
    guideKey: t.guideKey,
    data: t.data,
  }));
  const dayIdx = currentDayIndex(enrollment.startAt);
  const total = tasks.length;
  const done = tasks.filter((t) => t.doneAt).length;

  // 지금 해야 할 숙제 — 오늘까지 열린 것 중 아직 안 끝낸 첫 번째, 없으면 다음 예정 숙제
  const pending = tasks.filter((t) => !t.doneAt);
  const todayTask = pending.find((t) => t.day <= dayIdx) ?? pending[0] ?? null;

  // 숙제 카테고리별 참고 강의 영상 매핑 → { guideKey: {title, vimeoId} }
  const refMap = await getConsultingRefVideoMap();
  const refLessonIds = Object.values(refMap).filter(Boolean);
  const refLessons = refLessonIds.length
    ? await prisma.lesson.findMany({
        where: { id: { in: refLessonIds } },
        select: { id: true, title: true, vimeoId: true },
      })
    : [];
  const lessonById = new Map(refLessons.map((l) => [l.id, l]));
  const refVideos: Record<string, RefVideo> = {};
  for (const [gk, lid] of Object.entries(refMap)) {
    const l = lessonById.get(lid);
    if (l && l.vimeoId) refVideos[gk] = { title: l.title, vimeoId: l.vimeoId };
  }

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-gradient-to-b from-neutral-100 via-neutral-50 to-white text-neutral-900">
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-24">
          {/* Hero */}
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] p-8 sm:p-10 text-center mb-6">
            <div className="mx-auto mb-5 w-20 h-20 rounded-3xl ig-gradient shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_30px_-8px_rgba(131,58,180,0.5)] flex items-center justify-center">
              <Sparkles className="w-9 h-9 text-white drop-shadow" strokeWidth={2.25} />
            </div>
            <p className="text-[11px] font-bold tracking-[2px] uppercase text-neutral-500 mb-1">
              1:1 컨설팅 · 3주 실행 프로그램
            </p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 mb-2">
              {dayIdx >= 1 && dayIdx <= CONSULTING_DURATION_DAYS
                ? `Day ${dayIdx} · 오늘의 할 일`
                : dayIdx > CONSULTING_DURATION_DAYS
                  ? "3주 일정 완료"
                  : "곧 시작돼요"}
            </h1>
            <p className="text-[13px] text-neutral-500 inline-flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-neutral-400" />
              시작일 {formatKstHuman(enrollment.startAt)} · {done}/{total} 완료
            </p>
          </div>

          {todayTask && (
            <Link
              href={`/consulting/${todayTask.id}`}
              className="mb-4 flex items-center gap-3 rounded-2xl border border-pink-200 bg-pink-50 p-4 transition-colors hover:border-pink-400"
            >
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-pink-600" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-pink-600">지금 할 숙제부터 시작하세요</p>
                <p className="mt-0.5 truncate text-sm font-semibold text-pink-800">{todayTask.title}</p>
              </div>
              <span className="shrink-0 text-[12px] font-bold text-pink-600">열기</span>
            </Link>
          )}

          <TaskBoard
            startAtIso={enrollment.startAt.toISOString()}
            durationDays={CONSULTING_DURATION_DAYS}
            tasks={tasks}
            refVideos={refVideos}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
