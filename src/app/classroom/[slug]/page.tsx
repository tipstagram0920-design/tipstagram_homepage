import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { ClassroomClient } from "./ClassroomClient";
import { findCohortForNewPurchase } from "@/lib/challenge-enrollment";

async function getClassroomData(userId: string, slug: string) {
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId,
      refundedAt: null,
      product: { slug },
    },
    include: {
      product: {
        include: {
          course: {
            include: {
              sections: {
                orderBy: { order: "asc" },
                include: {
                  lessons: { orderBy: { order: "asc" } },
                },
              },
            },
          },
        },
      },
    },
  });
  return purchase;
}

export default async function ClassroomCoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?redirect=/classroom/${slug}`);
  }

  const purchase = await getClassroomData(session.user.id, slug).catch(() => null);
  if (!purchase) notFound();

  // 챌린지 계열은 영상 코스가 없다. 그대로 두면 195만원 결제 직후 "0/0 강 완료" 빈 강의실이 뜬다.
  // 실체는 기수 안내·대시보드이므로 그쪽으로 보낸다 (결제 성공 → /classroom/{slug} 로 오는 동선).
  if (!purchase.product.course) {
    const cohort = await findCohortForNewPurchase(session.user.id).catch(() => null);
    redirect(cohort ? `/challenge/${cohort.id}/start` : "/classroom");
  }

  const progresses = await prisma.progress.findMany({
    where: { userId: session.user.id },
  }).catch(() => []);

  const progressMap = Object.fromEntries(
    progresses.map((p) => [p.lessonId, p.completed])
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ClassroomClient
        product={purchase.product as Parameters<typeof ClassroomClient>[0]["product"]}
        progressMap={progressMap}
        userId={session.user.id}
      />
    </div>
  );
}
