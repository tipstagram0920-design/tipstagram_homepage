-- AlterTable
ALTER TABLE "challenge_enrollments" ADD COLUMN     "onboardedAt" TIMESTAMP(3),
ADD COLUMN     "onboarding" JSONB;
