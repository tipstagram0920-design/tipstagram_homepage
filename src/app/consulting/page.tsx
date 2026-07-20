import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getConsultingPassword, CONSULTING_DURATION_DAYS, currentDayIndex } from "@/lib/consulting";
import { TaskBoard, type BoardTask } from "@/components/consulting/TaskBoard";
import { PasswordGate } from "./_components/PasswordGate";
import { Sparkles, CalendarDays } from "lucide-react";
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
    order: t.order,
    title: t.title,
    description: t.description,
    doneAt: t.doneAt ? t.doneAt.toISOString() : null,
  }));
  const dayIdx = currentDayIndex(enrollment.startAt);
  const total = tasks.length;
  const done = tasks.filter((t) => t.doneAt).length;

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

          <TaskBoard
            startAtIso={enrollment.startAt.toISOString()}
            durationDays={CONSULTING_DURATION_DAYS}
            tasks={tasks}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
