-- CreateTable
CREATE TABLE "challenge_cohorts" (
    "id" TEXT NOT NULL,
    "productSlug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "week1StartAt" TIMESTAMP(3) NOT NULL,
    "weeksTotal" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenge_cohorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_weeks" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "weekIndex" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "homeworkPrompt" TEXT NOT NULL DEFAULT '',
    "openAt" TIMESTAMP(3) NOT NULL,
    "homeworkDueAt" TIMESTAMP(3) NOT NULL,
    "liveAt" TIMESTAMP(3),
    "zoomUrl" TEXT,
    "recordingUrl" TEXT,
    "recommendedLessonIds" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenge_weeks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homework_submissions" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "instagramUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "feedbackHtml" TEXT,
    "feedbackBy" TEXT,
    "feedbackAt" TIMESTAMP(3),

    CONSTRAINT "homework_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_reminder_sends" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "stepKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "error" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_reminder_sends_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "challenge_cohorts_productSlug_week1StartAt_idx" ON "challenge_cohorts"("productSlug", "week1StartAt");

-- CreateIndex
CREATE INDEX "challenge_weeks_openAt_idx" ON "challenge_weeks"("openAt");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_weeks_cohortId_weekIndex_key" ON "challenge_weeks"("cohortId", "weekIndex");

-- CreateIndex
CREATE INDEX "homework_submissions_userId_submittedAt_idx" ON "homework_submissions"("userId", "submittedAt");

-- CreateIndex
CREATE INDEX "homework_submissions_status_feedbackAt_idx" ON "homework_submissions"("status", "feedbackAt");

-- CreateIndex
CREATE UNIQUE INDEX "homework_submissions_weekId_userId_key" ON "homework_submissions"("weekId", "userId");

-- CreateIndex
CREATE INDEX "challenge_reminder_sends_weekId_sentAt_idx" ON "challenge_reminder_sends"("weekId", "sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_reminder_sends_weekId_stepKey_userId_key" ON "challenge_reminder_sends"("weekId", "stepKey", "userId");

-- AddForeignKey
ALTER TABLE "challenge_weeks" ADD CONSTRAINT "challenge_weeks_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "challenge_cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework_submissions" ADD CONSTRAINT "homework_submissions_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "challenge_weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework_submissions" ADD CONSTRAINT "homework_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_reminder_sends" ADD CONSTRAINT "challenge_reminder_sends_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "challenge_weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
