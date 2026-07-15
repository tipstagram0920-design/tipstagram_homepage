import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { assertCohortEnrollment } from "@/lib/challenge-enrollment";
import { formatKstHuman } from "@/lib/kst";
import {
  ChevronLeft,
  Video,
  BookOpen,
  ExternalLink,
  PenSquare,
  CheckCircle2,
  MessageSquareText,
  Mail,
  PlaySquare,
  Calendar,
} from "lucide-react";
import { HomeworkForm } from "./HomeworkForm";
import type { LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

function detectEmbed(url: string | null | undefined): { kind: "youtube" | "vimeo" | "raw"; embedUrl: string } | null {
  if (!url) return null;
  const s = url.trim();
  if (!s) return null;
  const yt = s.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: "youtube", embedUrl: `https://www.youtube.com/embed/${yt[1]}` };
  const vim = s.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vim) return { kind: "vimeo", embedUrl: `https://player.vimeo.com/video/${vim[1]}` };
  if (/^\d+$/.test(s)) return { kind: "vimeo", embedUrl: `https://player.vimeo.com/video/${s}` };
  if (/^[\w-]{11}$/.test(s)) return { kind: "youtube", embedUrl: `https://www.youtube.com/embed/${s}` };
  return { kind: "raw", embedUrl: s };
}

// Apple 시스템 설정 스타일의 섹션 헤더 (그라디언트 아이콘 배지 + 제목)
function SectionHeader({
  icon: Icon,
  title,
  gradient,
}: {
  icon: LucideIcon;
  title: string;
  gradient: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4 px-1">
      <div
        className={
          "w-9 h-9 rounded-xl flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_10px_-4px_rgba(0,0,0,0.3)] " +
          gradient
        }
      >
        <Icon className="w-4.5 h-4.5 text-white" strokeWidth={2.25} />
      </div>
      <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
    </div>
  );
}

export default async function ChallengeWeekPage({
  params,
}: {
  params: Promise<{ cohortId: string; weekIndex: string }>;
}) {
  const session = await auth();
  const { cohortId, weekIndex } = await params;
  const idx = parseInt(weekIndex);
  if (isNaN(idx) || idx < 1) notFound();

  if (!session?.user?.id) {
    redirect(`/login?redirect=/challenge/${cohortId}/week/${idx}`);
  }

  const enrolled = await assertCohortEnrollment(session.user.id, cohortId);
  if (!enrolled) notFound();

  const week = await prisma.challengeWeek.findFirst({
    where: { cohortId, weekIndex: idx },
  });
  if (!week) notFound();

  const now = new Date();
  const opened = week.openAt.getTime() <= now.getTime();
  if (!opened) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-b from-neutral-100 via-neutral-50 to-white text-neutral-900">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-32 pb-20 text-center">
            <h1 className="text-2xl font-black mb-2">
              Week {week.weekIndex}은(는) 아직 열리지 않았어요
            </h1>
            <p className="text-neutral-500 mb-6">
              오픈 예정 · {formatKstHuman(week.openAt)}
            </p>
            <Link
              href={`/challenge/${cohortId}`}
              className="inline-flex items-center gap-1 text-sm text-neutral-700 hover:text-neutral-900"
            >
              <ChevronLeft className="w-4 h-4" /> 대시보드로
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const mySubmission = await prisma.homeworkSubmission.findUnique({
    where: { weekId_userId: { weekId: week.id, userId: session.user.id } },
  });

  const recommendedLessonIds =
    Array.isArray(week.recommendedLessonIds) ? (week.recommendedLessonIds as string[]) : [];
  const recommendedLessons =
    recommendedLessonIds.length > 0
      ? await prisma.lesson.findMany({
          where: { id: { in: recommendedLessonIds } },
          include: {
            section: {
              include: { course: { include: { product: { select: { slug: true } } } } },
            },
          },
        })
      : [];
  const recommendedSorted = recommendedLessonIds
    .map((id) => recommendedLessons.find((l) => l.id === id))
    .filter(Boolean) as typeof recommendedLessons;

  const externalVideos = Array.isArray(week.externalVideos)
    ? (week.externalVideos as Array<{ title: string; url: string; description?: string }>)
    : [];

  const recordingEmbed = detectEmbed(week.recordingUrl);

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-gradient-to-b from-neutral-100 via-neutral-50 to-white text-neutral-900 overflow-hidden">
        {/* vibrancy 백드롭 */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,180,220,0.5), transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-60 -right-40 w-[520px] h-[520px] rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(180,200,255,0.5), transparent 70%)" }}
        />

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-24">
          <Link
            href={`/challenge/${cohortId}`}
            className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 mb-4"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> 챌린지 대시보드
          </Link>

          {/* Hero 카드 */}
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] p-8 sm:p-10 text-center mb-8">
            <div className="mx-auto mb-5 w-20 h-20 rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-700 text-white flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_30px_-8px_rgba(0,0,0,0.4)]">
              <span className="text-2xl font-black">W{week.weekIndex}</span>
            </div>
            <p className="text-[11px] font-bold tracking-[2px] uppercase text-neutral-500 mb-1">
              Week {week.weekIndex}
            </p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 mb-3">
              {week.title || `Week ${week.weekIndex}`}
            </h1>
            <div className="inline-flex items-center gap-1.5 text-[13px] text-neutral-500">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>숙제 마감 · <span className="text-neutral-900 font-semibold">{formatKstHuman(week.homeworkDueAt)}</span></span>
              {week.liveAt && (
                <>
                  <span className="mx-1 text-neutral-300">·</span>
                  <span>라이브 {formatKstHuman(week.liveAt)}</span>
                </>
              )}
            </div>
          </div>

          {week.description && (
            <div
              className="text-sm text-neutral-700 leading-relaxed prose prose-neutral prose-sm max-w-none mb-10 px-2"
              dangerouslySetInnerHTML={{ __html: week.description }}
            />
          )}

          {/* 1. 라이브 다시보기 */}
          <section className="mb-10">
            <SectionHeader icon={Video} title="라이브 다시보기" gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
            {recordingEmbed ? (
              <div className="relative w-full rounded-3xl overflow-hidden bg-black shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)]" style={{ aspectRatio: "16 / 9" }}>
                <iframe
                  src={recordingEmbed.embedUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : week.recordingUrl ? (
              <a
                href={week.recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold shadow-[0_6px_20px_-6px_rgba(0,0,0,0.4)]"
              >
                다시보기 열기 <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <div className="rounded-3xl border border-neutral-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-6 text-center text-sm text-neutral-500">
                라이브 녹화본이 아직 업로드되지 않았어요. 준비되는 대로 이메일로 안내드립니다.
              </div>
            )}
          </section>

          {/* 2. 참고 영상 */}
          {externalVideos.length > 0 && (
            <section className="mb-10">
              <SectionHeader icon={PlaySquare} title="참고 영상" gradient="bg-gradient-to-br from-rose-500 to-red-600" />
              <div className="rounded-3xl bg-white border border-neutral-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
                {externalVideos.map((v, i) => {
                  const isLast = i === externalVideos.length - 1;
                  return (
                    <a
                      key={i}
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        "flex items-center gap-4 px-5 py-4 hover:bg-neutral-50/80 transition-colors " +
                        (isLast ? "" : "border-b border-neutral-200/70")
                      }
                    >
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_10px_-4px_rgba(220,38,38,0.4)]">
                        <PlaySquare className="w-4.5 h-4.5" strokeWidth={2.25} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 truncate">
                          {v.title || v.url}
                        </p>
                        {v.description && (
                          <p className="text-[11.5px] text-neutral-500 mt-0.5 truncate">
                            {v.description}
                          </p>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-neutral-400 shrink-0" />
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {/* 3. 추천 강의 */}
          {recommendedSorted.length > 0 && (
            <section className="mb-10">
              <SectionHeader icon={BookOpen} title="이번 주 볼 강의" gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
              <p className="text-[12px] text-neutral-500 mb-3 px-1">
                marketing-booster 66강 중 이번 주에 맞춰 골라놨어요. 순서대로 학습하세요.
              </p>
              <div className="rounded-3xl bg-white border border-neutral-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
                {recommendedSorted.map((l, i) => {
                  const productSlug = l.section.course.product.slug;
                  const isLast = i === recommendedSorted.length - 1;
                  return (
                    <Link
                      key={l.id}
                      href={`/classroom/${productSlug}?lessonId=${l.id}`}
                      className={
                        "flex items-center gap-4 px-5 py-4 hover:bg-neutral-50/80 transition-colors " +
                        (isLast ? "" : "border-b border-neutral-200/70")
                      }
                    >
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-bold flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_10px_-4px_rgba(234,88,12,0.4)]">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 truncate">{l.title}</p>
                        <p className="text-[11.5px] text-neutral-500 mt-0.5">
                          {l.section.title}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-neutral-400 shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* 4. 팁스타그램의 편지 */}
          {week.homeworkPrompt && (
            <section id="letter" className="mb-10 scroll-mt-24">
              <SectionHeader icon={Mail} title="팁스타그램의 편지" gradient="bg-gradient-to-br from-violet-500 to-purple-600" />
              <div className="rounded-3xl bg-white border border-neutral-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-7 sm:p-8">
                <div className="text-[15px] text-neutral-800 leading-[1.85] whitespace-pre-wrap">
                  {week.homeworkPrompt}
                </div>
              </div>
            </section>
          )}

          {/* 5. 숙제 */}
          <section id="homework" className="mb-6 scroll-mt-24">
            <SectionHeader icon={PenSquare} title="이번 주 숙제" gradient="bg-gradient-to-br from-neutral-800 to-neutral-900" />

            {mySubmission?.feedbackHtml && mySubmission.feedbackAt && (
              <div className="rounded-3xl bg-white border border-emerald-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-6 sm:p-7 mb-6">
                <p className="text-xs font-bold text-emerald-700 mb-2 uppercase tracking-wide inline-flex items-center gap-1.5">
                  <MessageSquareText className="w-3.5 h-3.5" /> 강사 피드백 · {formatKstHuman(mySubmission.feedbackAt)}
                </p>
                <div
                  className="prose prose-neutral prose-sm max-w-none text-neutral-800"
                  dangerouslySetInnerHTML={{ __html: mySubmission.feedbackHtml }}
                />
              </div>
            )}

            <div className="rounded-3xl bg-white border border-neutral-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-6 sm:p-7">
              <HomeworkForm
                cohortId={cohortId}
                weekId={week.id}
                weekIndex={week.weekIndex}
                initial={
                  mySubmission
                    ? {
                        content: mySubmission.content,
                        imageUrls: mySubmission.imageUrls,
                        instagramUrl: mySubmission.instagramUrl ?? "",
                        submittedAt: mySubmission.submittedAt.toISOString(),
                        hasFeedback: !!mySubmission.feedbackAt,
                      }
                    : null
                }
              />
            </div>
          </section>

          {mySubmission && !mySubmission.feedbackAt && (
            <p className="text-center text-xs text-neutral-500 mt-4 inline-flex items-center gap-1.5 justify-center w-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-neutral-700" />
              제출 완료 · 강사가 확인하는 즉시 이메일로 피드백을 알려 드려요
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
