-- 라이브 관제탑: 무료 라이브 한 회차의 원본. 랜딩·캠페인·문안·기수·팁스킷이 전부 여기서 파생된다.
CREATE TABLE "live_events" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "youtubeUrl" TEXT,
  "replayUrl" TEXT,
  "signupCloseAt" TIMESTAMP(3),
  "salesCloseAt" TIMESTAMP(3),
  "chatUrl" TEXT,
  "cohortId" TEXT,
  "campaignId" TEXT,
  "tipskitSlug" TEXT,
  "tipskitSyncedAt" TIMESTAMP(3),
  "tipskitSyncError" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "live_events_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "live_events_cohortId_key" ON "live_events"("cohortId");
CREATE UNIQUE INDEX "live_events_campaignId_key" ON "live_events"("campaignId");
CREATE INDEX "live_events_isActive_startsAt_idx" ON "live_events"("isActive", "startsAt");
ALTER TABLE "live_events" ADD CONSTRAINT "live_events_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "challenge_cohorts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "live_events" ADD CONSTRAINT "live_events_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "webinar_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
