CREATE TABLE "track_events" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "country" TEXT,
    "userAgent" TEXT,
    "contactId" TEXT,
    "props" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "track_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "track_events_type_path_createdAt_idx" ON "track_events"("type","path","createdAt");
CREATE INDEX "track_events_sessionId_idx" ON "track_events"("sessionId");
CREATE INDEX "track_events_path_createdAt_idx" ON "track_events"("path","createdAt");
CREATE INDEX "track_events_contactId_idx" ON "track_events"("contactId");
