-- AlterTable
ALTER TABLE "challenge_cohorts" ADD COLUMN     "accessPassword" TEXT;

-- CreateTable
CREATE TABLE "challenge_enrollments" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "challenge_enrollments_userId_idx" ON "challenge_enrollments"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_enrollments_cohortId_userId_key" ON "challenge_enrollments"("cohortId", "userId");

-- AddForeignKey
ALTER TABLE "challenge_enrollments" ADD CONSTRAINT "challenge_enrollments_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "challenge_cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_enrollments" ADD CONSTRAINT "challenge_enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
