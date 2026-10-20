ALTER TABLE "live_events" ADD COLUMN "promoQueuedAt" TIMESTAMP(3), ADD COLUMN "promoNote" TEXT;
CREATE TABLE "live_enter_clicks" (
  "id" TEXT NOT NULL, "liveId" TEXT NOT NULL, "contactId" TEXT, "email" TEXT, "via" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "live_enter_clicks_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "live_enter_clicks_liveId_createdAt_idx" ON "live_enter_clicks"("liveId", "createdAt");
ALTER TABLE "live_enter_clicks" ADD CONSTRAINT "live_enter_clicks_liveId_fkey" FOREIGN KEY ("liveId") REFERENCES "live_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
