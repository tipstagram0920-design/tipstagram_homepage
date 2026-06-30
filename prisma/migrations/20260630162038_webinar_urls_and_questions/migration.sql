ALTER TABLE "webinar_campaigns"
  ADD COLUMN "zoomUrl" TEXT,
  ADD COLUMN "salesUrl" TEXT,
  ADD COLUMN "preQuestionUrl" TEXT;

CREATE TABLE "webinar_questions" (
  "id" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "contactId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "webinar_questions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "webinar_questions_campaignId_createdAt_idx" ON "webinar_questions"("campaignId","createdAt");
CREATE INDEX "webinar_questions_email_idx" ON "webinar_questions"("email");
CREATE INDEX "webinar_questions_contactId_idx" ON "webinar_questions"("contactId");
ALTER TABLE "webinar_questions" ADD CONSTRAINT "webinar_questions_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "webinar_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "webinar_questions" ADD CONSTRAINT "webinar_questions_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
