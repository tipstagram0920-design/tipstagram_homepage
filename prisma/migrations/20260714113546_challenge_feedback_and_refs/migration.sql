-- AlterTable
ALTER TABLE "challenge_weeks" ADD COLUMN     "externalVideos" JSONB;

-- AlterTable
ALTER TABLE "homework_submissions" ADD COLUMN     "feedbackJson" JSONB;
