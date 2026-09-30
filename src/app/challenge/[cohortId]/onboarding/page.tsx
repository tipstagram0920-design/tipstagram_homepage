import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { assertCohortEnrollment, getOnboarding } from "@/lib/challenge-enrollment";
import { OnboardingWizard } from "./_components/OnboardingWizard";

export const dynamic = "force-dynamic";

/**
 * 시작 전 방향 선택.
 * 챌린지에 처음 들어온 사람은 대시보드·주차 페이지에서 여기로 보내진다.
 * 이미 고른 사람이 다시 고르러 올 수도 있어서(?redo=1) 그때는 이전 답을 채워둔다.
 */
export default async function ChallengeOnboardingPage({
  params,
  searchParams,
}: {
  params: Promise<{ cohortId: string }>;
  searchParams: Promise<{ redo?: string }>;
}) {
  const { cohortId } = await params;
  const { redo } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?redirect=/challenge/${cohortId}/onboarding`);
  }

  const access = await assertCohortEnrollment(session.user.id, cohortId);
  if (!access) notFound();

  const { answers, done } = await getOnboarding(session.user.id, cohortId);
  // 이미 골랐는데 그냥 들어온 경우엔 대시보드로 돌려보낸다
  if (done && redo !== "1") redirect(`/challenge/${cohortId}`);

  return (
    <OnboardingWizard
      cohortName={access.cohort.name}
      nextHref={`/challenge/${cohortId}`}
      saveUrl={`/api/challenge/${cohortId}/onboarding`}
      initialAnswers={redo === "1" ? answers : undefined}
    />
  );
}
