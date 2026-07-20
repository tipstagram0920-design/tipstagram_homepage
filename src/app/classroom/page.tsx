import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { BookOpen, Clock, Trophy, ArrowRight, Sparkles } from "lucide-react";
import { findEnrolledCohortsForUser } from "@/lib/challenge-enrollment";
import { formatKstHuman } from "@/lib/kst";

async function getUserPurchases(userId: string) {
  return await prisma.purchase.findMany({
    where: { userId, refundedAt: null },
    include: {
      product: {
        include: {
          course: {
            include: {
              sections: {
                include: { lessons: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getProgressMap(userId: string, lessonIds: string[]) {
  if (lessonIds.length === 0) return {};
  const progresses = await prisma.progress.findMany({
    where: { userId, lessonId: { in: lessonIds }, completed: true },
  });
  return Object.fromEntries(progresses.map((p) => [p.lessonId, true]));
}

export default async function ClassroomPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?redirect=/classroom");

  const purchases = await getUserPurchases(session.user.id).catch(() => []);
  const enrolledCohorts = await findEnrolledCohortsForUser(session.user.id).catch(() => []);
  const consultingEnrollment = await prisma.consultingEnrollment
    .findUnique({ where: { userId: session.user.id }, select: { id: true } })
    .catch(() => null);

  const allLessonIds = purchases.flatMap(
    (p) => p.product.course?.sections.flatMap((s) => s.lessons.map((l) => l.id)) || []
  );
  const progressMap: Record<string, boolean> = await getProgressMap(session.user.id, allLessonIds).catch(() => ({}));

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight mb-2">
            내 강의실
          </h1>
          <p className="text-neutral-500 mb-10">구매한 강의를 수강하세요</p>

          {/* 5주 챌린지 진입 카드 */}
          {enrolledCohorts.length > 0 && (
            <div className="mb-10 space-y-3">
              <p className="text-xs font-bold tracking-[2px] text-pink-600 uppercase">
                진행 중인 챌린지
              </p>
              {enrolledCohorts.map((c) => (
                <Link
                  key={c.id}
                  href={`/challenge/${c.id}`}
                  className="group flex items-center gap-5 rounded-3xl bg-neutral-950 p-6 sm:p-7 hover:shadow-2xl hover:-translate-y-0.5 transition-all"
                >
                  <div className="shrink-0 w-14 h-14 rounded-2xl ig-gradient text-white flex items-center justify-center">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0 text-white">
                    <p className="text-[11px] font-bold tracking-wider uppercase text-white/60">
                      5주 챌린지
                    </p>
                    <h2 className="text-lg sm:text-xl font-black mt-0.5 truncate">
                      <span className="ig-gradient-text">{c.name}</span>
                    </h2>
                    <p className="text-xs text-white/60 mt-1">
                      Week 1 오픈 · {formatKstHuman(c.week1StartAt)}
                    </p>
                  </div>
                  <div className="shrink-0 inline-flex items-center gap-1 text-sm font-bold text-white group-hover:text-pink-400">
                    대시보드 열기 <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* 1:1 컨설팅 진입 카드 */}
          {consultingEnrollment && (
            <div className="mb-10">
              <p className="text-xs font-bold tracking-[2px] text-pink-600 uppercase mb-3">
                진행 중인 컨설팅
              </p>
              <Link
                href="/consulting"
                className="group flex items-center gap-5 rounded-3xl bg-neutral-950 p-6 sm:p-7 hover:shadow-2xl hover:-translate-y-0.5 transition-all"
              >
                <div className="shrink-0 w-14 h-14 rounded-2xl ig-gradient text-white flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 text-white">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-white/60">
                    1:1 컨설팅
                  </p>
                  <h2 className="text-lg sm:text-xl font-black mt-0.5">
                    <span className="ig-gradient-text">3주 실행 프로그램</span>
                  </h2>
                  <p className="text-xs text-white/60 mt-1">오늘의 할 일을 확인하세요</p>
                </div>
                <div className="shrink-0 inline-flex items-center gap-1 text-sm font-bold text-white group-hover:text-pink-400">
                  열기 <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          )}

          {purchases.length === 0 ? (
            <div className="text-center py-24 bg-neutral-50 rounded-2xl">
              <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-neutral-900">수강 중인 강의가 없습니다</h3>
              <p className="text-neutral-500 mt-2 mb-6">강의를 구매하고 학습을 시작해보세요</p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl ig-gradient text-white font-bold text-sm"
              >
                강의 둘러보기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchases.map((purchase) => {
                const course = purchase.product.course;
                const lessons = course?.sections.flatMap((s) => s.lessons) || [];
                const completed = lessons.filter((l) => progressMap[l.id]).length;
                const progress = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;

                return (
                  <Link
                    key={purchase.id}
                    href={`/classroom/${purchase.product.slug}`}
                    className="bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className="aspect-video bg-neutral-100 relative overflow-hidden">
                      {purchase.product.thumbnail ? (
                        <img
                          src={purchase.product.thumbnail}
                          alt={purchase.product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full ig-gradient flex items-center justify-center">
                          <span className="text-white text-4xl font-black italic">T</span>
                        </div>
                      )}
                      {/* Progress badge */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-bold text-neutral-900">
                        {progress}%
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-neutral-900 line-clamp-2 group-hover:text-pink-600 transition-colors">
                        {purchase.product.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-neutral-400">
                        <Clock className="w-3 h-3" />
                        <span>{completed}/{lessons.length} 강 완료</span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full ig-gradient rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
