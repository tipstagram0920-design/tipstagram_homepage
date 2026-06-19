CREATE TABLE "webinar_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "webinarDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "audience" JSONB NOT NULL,
    "steps" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "skipPast" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webinar_campaigns_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "webinar_campaign_sends" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "contactId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webinar_campaign_sends_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "webinar_campaign_sends_campaignId_stepIndex_contactId_key" ON "webinar_campaign_sends"("campaignId", "stepIndex", "contactId");
CREATE INDEX "webinar_campaign_sends_campaignId_sentAt_idx" ON "webinar_campaign_sends"("campaignId", "sentAt");
ALTER TABLE "webinar_campaign_sends" ADD CONSTRAINT "webinar_campaign_sends_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "webinar_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
