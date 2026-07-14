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
} from "lucide-react";
import { HomeworkForm } from "./HomeworkForm";

export const dynamic = "force-dynamic";

/**
 * URL 문자열에서 YouTube ID / Vimeo ID / iframe src 형태 하나로 정규화.
 * marketing-booster 등에서 Lesson.vimeoId 에는 순수 ID 또는 URL 이 들어갈 수 있음.
 */
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
    // 아직 안 열린 주차 접근 시 안내
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-neutral-950 text-white">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-32 pb-20 text-center">
            <h1 className="text-2xl font-black mb-2">
              Week {week.weekIndex}은(는) 아직 열리지 않았어요
            </h1>
            <p className="text-white/60 mb-6">
              오픈 예정 · {formatKstHuman(week.openAt)}
            </p>
            <Link
              href={`/challenge/${cohortId}`}
              className="inline-flex items-center gap-1 text-sm text-pink-400 hover:text-pink-300"
            >
              <ChevronLeft className="w-4 h-4" /> 대시보드로
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // 내 제출 조회
  const mySubmission = await prisma.homeworkSubmission.findUnique({
    where: { weekId_userId: { weekId: week.id, userId: session.user.id } },
  });

  // 추천 강의 조회
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

  const recordingEmbed = detectEmbed(week.recordingUrl);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-950 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-24">
          <Link
            href={`/challenge/${cohortId}`}
            className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white/80 mb-4"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> 챌린지 대시보드
          </Link>

          <p className="text-xs font-bold tracking-[2px] text-pink-400 uppercase mb-2">
            Week {week.weekIndex}
          </p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
            {week.title || `Week ${week.weekIndex}`}
          </h1>
          <p className="text-sm text-white/60 mb-8">
            숙제 마감 · <span className="text-white/90 font-bold">{formatKstHuman(week.homeworkDueAt)}</span>
            {week.liveAt && (
              <>
                <span className="mx-2 text-white/30">·</span>
                라이브 · {formatKstHuman(week.liveAt)}
              </>
            )}
          </p>

          {week.description && (
            <div
              className="text-sm text-white/75 leading-relaxed prose prose-invert prose-sm max-w-none mb-10"
              dangerouslySetInnerHTML={{ __html: week.description }}
            />
          )}

          {/* 1. 라이브 다시보기 */}
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-3 inline-flex items-center gap-2">
              <Video className="w-5 h-5 text-pink-400" /> 라이브 다시보기
            </h2>
            {recordingEmbed ? (
              <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "16 / 9" }}>
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
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold"
              >
                다시보기 열기 <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/50">
                라이브 녹화본이 아직 업로드되지 않았어요. 준비되는 대로 이메일로 안내드립니다.
              </div>
            )}
          </section>

          {/* 2. 추천 강의 */}
          {recommendedSorted.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-bold mb-3 inline-flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-300" /> 이번 주 볼 강의
              </h2>
              <p className="text-xs text-white/50 mb-4">
                marketing-booster 66강 중 이번 주에 맞춰 골라놨어요. 순서대로 학습하세요.
              </p>
              <ul className="space-y-2">
                {recommendedSorted.map((l, i) => {
                  const productSlug = l.section.course.product.slug;
                  return (
                    <li key={l.id}>
                      <Link
                        href={`/classroom/${productSlug}?lessonId=${l.id}`}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06] hover:border-white/20"
                      >
                        <span className="shrink-0 w-8 h-8 rounded-lg bg-white/10 text-white/70 text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{l.title}</p>
                          <p className="text-[11px] text-white/40 mt-0.5">
                            {l.section.title}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-white/30" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* 3. 팁스타그램의 편지 + 숙제 */}
          {week.homeworkPrompt ? (
            <section id="letter" className="mb-8 scroll-mt-24">
              <div className="rounded-3xl border border-pink-400/20 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent p-6 sm:p-8">
                <p className="text-xs font-bold tracking-[2px] text-pink-400 uppercase mb-3 inline-flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> 팁스타그램의 편지
                </p>
                <div className="text-[15px] text-white/90 leading-[1.85] whitespace-pre-wrap">
                  {week.homeworkPrompt}
                </div>
              </div>
            </section>
          ) : (
            <section className="mb-8">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-white/50">
                팁스타그램의 편지가 곧 도착합니다.
              </div>
            </section>
          )}

          <section id="homework" className="mb-6 scroll-mt-24">
            <h2 className="text-lg font-bold mb-3 inline-flex items-center gap-2">
              <PenSquare className="w-5 h-5 text-pink-400" /> 이번 주 숙제
            </h2>

            {mySubmission?.feedbackHtml && mySubmission.feedbackAt && (
              <div className="rounded-2xl border-2 border-green-400/30 bg-green-400/[0.08] p-5 sm:p-6 mb-6">
                <p className="text-xs font-bold text-green-400 mb-2 uppercase tracking-wide inline-flex items-center gap-1.5">
                  <MessageSquareText className="w-3.5 h-3.5" /> 강사 피드백 · {formatKstHuman(mySubmission.feedbackAt)}
                </p>
                <div
                  className="prose prose-invert prose-sm max-w-none text-white/90"
                  dangerouslySetInnerHTML={{ __html: mySubmission.feedbackHtml }}
                />
              </div>
            )}

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
          </section>

          {mySubmission && !mySubmission.feedbackAt && (
            <p className="text-center text-xs text-white/50 mt-2 inline-flex items-center gap-1.5 justify-center w-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
              제출 완료 · 강사가 확인하는 즉시 이메일로 피드백을 알려 드려요
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
