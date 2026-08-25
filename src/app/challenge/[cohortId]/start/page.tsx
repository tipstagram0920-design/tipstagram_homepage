import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertCohortEnrollment } from "@/lib/challenge-enrollment";
import { StartGuide } from "./_components/StartGuide";

export const dynamic = "force-dynamic";

/**
 * 기수 시작 안내(오리엔테이션).
 *
 * 결제 직후 구매자가 처음 보는 화면이다 — 5주가 어떻게 굴러가는지, 지금 당장 뭘 해야 하는지를 준다.
 * 날짜는 전부 기수 데이터에서 뽑으므로 **새 기수를 만들면 그대로 따라온다**(lib/challenge-schedule.ts).
 */
export default async function ChallengeStartPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?redirect=/challenge/${cohortId}/start`);

  const enrolled = await assertCohortEnrollment(session.user.id, cohortId);
  if (!enrolled) notFound();

  const cohort = await prisma.challengeCohort.findUnique({
    where: { id: cohortId },
    select: {
      id: true,
      name: true,
      week1StartAt: true,
      openChatUrl: true,
      weeks: {
        orderBy: { weekIndex: "asc" },
        select: { weekIndex: true, openAt: true, liveAt: true, homeworkDueAt: true },
      },
    },
  });
  if (!cohort) notFound();

  return <StartGuide cohort={cohort} />;
}
