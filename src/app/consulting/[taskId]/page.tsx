import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TaskGuide, GUIDE_LABELS } from "@/components/consulting/guides/TaskGuide";
import { getConsultingRefVideoMap, splitIntakeNote } from "@/lib/consulting";
import { parseVideoSource, getEmbedUrl } from "@/lib/video";
import { TaskDoneButton } from "./_components/TaskDoneButton";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  PlayCircle,
  StickyNote,
  Wand2,
} from "lucide-react";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function dateLabel(startAt: Date, day: number): string {
  const d = new Date(startAt);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + (day - 1));
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
}

export default async function ConsultingTaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?redirect=/consulting");

  const { taskId } = await params;
  const task = await prisma.consultingTask.findUnique({
    where: { id: taskId },
    include: { enrollment: true },
  });

  const isAdmin = (session.user as { role?: string }).role === "ADMIN";
  if (!task || (task.enrollment.userId !== session.user.id && !isAdmin)) notFound();

  // 이전/다음 숙제 (같은 등록의 전체 순서 기준)
  const siblings = await prisma.consultingTask.findMany({
    where: { enrollmentId: task.enrollmentId },
    orderBy: [{ day: "asc" }, { order: "asc" }],
    select: { id: true, title: true, day: true, doneAt: true },
  });
  const idx = siblings.findIndex((t) => t.id === task.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const doneCount = siblings.filter((t) => t.doneAt).length;

  // 참고 강의 영상
  const refMap = await getConsultingRefVideoMap();
  const refLessonId = task.guideKey ? refMap[task.guideKey] : undefined;
  const refLesson = refLessonId
    ? await prisma.lesson.findUnique({
        where: { id: refLessonId },
        select: { title: true, vimeoId: true },
      })
    : null;
  const refVideo = refLesson?.vimeoId ? parseVideoSource(refLesson.vimeoId) : null;

  const { note: intakeNote, body: description } = splitIntakeNote(task.description);
  const isDone = !!task.doneAt;
  const spansDays = task.endDay && task.endDay > task.day;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-neutral-100 via-neutral-50 to-white text-neutral-900">
        <div className="mx-auto max-w-2xl px-4 pb-24 pt-20 sm:px-6">
          <Link
            href="/consulting"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" /> 전체 숙제 목록
          </Link>

          {/* ── 헤더 ── */}
          <div className="rounded-3xl border border-white/60 bg-white/70 p-7 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:p-9">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-lg ig-gradient px-2.5 py-1 text-[11px] font-black text-white">
                {spansDays ? `Day ${task.day}~${task.endDay}` : `Day ${task.day}`}
              </span>
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-neutral-500">
                <CalendarDays className="h-3.5 w-3.5" />
                {dateLabel(task.enrollment.startAt, task.day)}
              </span>
              {isDone && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 완료
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black leading-snug tracking-tight text-neutral-900 sm:text-[28px]">
              {task.title}
            </h1>

            {description.trim() && (
              <p className="mt-4 whitespace-pre-wrap text-[15px] leading-8 text-neutral-600">
                {description.trim()}
              </p>
            )}

            <p className="mt-5 text-[12px] font-semibold text-neutral-400">
              전체 {siblings.length}개 중 {idx + 1}번째 · {doneCount}개 완료
            </p>
          </div>

          {/* ── 등록 메모 ── */}
          {intakeNote && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="inline-flex items-center gap-1.5 text-[13px] font-bold text-amber-800">
                <StickyNote className="h-3.5 w-3.5" /> 등록할 때 남기신 내용
              </p>
              <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-7 text-amber-900/80">
                {intakeNote}
              </p>
            </div>
          )}

          {/* ── 참고 강의 (바로 재생) ── */}
          {refLesson && refVideo && (
            <section className="mt-4 rounded-2xl border border-neutral-200/70 bg-white p-5">
              <p className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-indigo-600">
                <PlayCircle className="h-4 w-4" /> 먼저 보면 좋은 강의 · {refLesson.title}
              </p>
              <div className="aspect-video overflow-hidden rounded-xl border border-neutral-200 bg-black">
                <iframe
                  src={getEmbedUrl(refVideo)}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={refLesson.title}
                />
              </div>
            </section>
          )}

          {/* ── 도우미 (펼침 없이 바로 노출) ── */}
          {task.guideKey && (
            <section className="mt-4 rounded-2xl border border-pink-200 bg-white p-5 sm:p-6">
              <p className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-pink-600">
                <Wand2 className="h-4 w-4" /> {GUIDE_LABELS[task.guideKey] ?? "작성 도우미"}
              </p>
              <TaskGuide guideKey={task.guideKey} taskId={task.id} data={task.data} />
            </section>
          )}

          {/* ── 완료 처리 ── */}
          <div className="mt-6 rounded-2xl border border-neutral-200/70 bg-white p-5 sm:p-6">
            <p className="mb-3 text-[13px] font-bold text-neutral-900">다 하셨나요?</p>
            <p className="mb-4 text-[13px] leading-6 text-neutral-500">
              완료로 표시하면 목록과 달력에서 초록색으로 바뀌고, 진행률에 반영됩니다.
            </p>
            <TaskDoneButton taskId={task.id} initialDone={isDone} />
          </div>

          {/* ── 이전 / 다음 ── */}
          <nav className="mt-6 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/consulting/${prev.id}`}
                className="group rounded-2xl border border-neutral-200/70 bg-white p-4 transition-colors hover:border-neutral-400"
              >
                <p className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-400">
                  <ChevronLeft className="h-3 w-3" /> 이전 숙제 · Day {prev.day}
                </p>
                <p className="mt-1 line-clamp-2 text-[13.5px] font-semibold text-neutral-800">
                  {prev.title}
                </p>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {next && (
              <Link
                href={`/consulting/${next.id}`}
                className="group rounded-2xl border border-neutral-200/70 bg-white p-4 text-right transition-colors hover:border-neutral-400 sm:col-start-2"
              >
                <p className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-400">
                  다음 숙제 · Day {next.day} <ArrowRight className="h-3 w-3" />
                </p>
                <p className="mt-1 line-clamp-2 text-[13.5px] font-semibold text-neutral-800">
                  {next.title}
                </p>
              </Link>
            )}
          </nav>
        </div>
      </main>
      <Footer />
    </>
  );
}
