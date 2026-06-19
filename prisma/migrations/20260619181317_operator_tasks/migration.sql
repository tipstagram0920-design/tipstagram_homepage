CREATE TABLE "operator_tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notifiedAt" TIMESTAMP(3),
    "doneAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operator_tasks_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "operator_tasks_scheduledAt_status_idx" ON "operator_tasks"("scheduledAt", "status");
CREATE INDEX "operator_tasks_campaignId_idx" ON "operator_tasks"("campaignId");
