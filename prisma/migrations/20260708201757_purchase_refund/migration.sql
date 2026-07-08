ALTER TABLE "purchases"
  ADD COLUMN "refundedAt" TIMESTAMP(3),
  ADD COLUMN "refundReason" TEXT,
  ADD COLUMN "refundedBy" TEXT;
CREATE INDEX "purchases_refundedAt_idx" ON "purchases"("refundedAt");
