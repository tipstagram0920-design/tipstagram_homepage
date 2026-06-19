CREATE TABLE "consultation_requests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "instagramHandle" TEXT,
    "followerCount" TEXT,
    "painPoint" TEXT NOT NULL,
    "contactId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultation_requests_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "consultation_requests_createdAt_idx" ON "consultation_requests"("createdAt");
CREATE INDEX "consultation_requests_status_idx" ON "consultation_requests"("status");
CREATE INDEX "consultation_requests_contactId_idx" ON "consultation_requests"("contactId");
ALTER TABLE "consultation_requests" ADD CONSTRAINT "consultation_requests_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
