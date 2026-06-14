-- CreateTable
CREATE TABLE "live_signups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_signups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "live_signups_email_key" ON "live_signups"("email");

-- CreateIndex
CREATE INDEX "live_signups_createdAt_idx" ON "live_signups"("createdAt");
