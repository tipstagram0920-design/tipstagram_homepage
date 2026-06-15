CREATE TABLE "ebook_submissions" (
    "id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "screenshotUrl" TEXT,
    "contactId" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ebook_submissions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ebook_submissions_email_idx" ON "ebook_submissions"("email");
CREATE INDEX "ebook_submissions_level_createdAt_idx" ON "ebook_submissions"("level", "createdAt");
CREATE INDEX "ebook_submissions_contactId_idx" ON "ebook_submissions"("contactId");
ALTER TABLE "ebook_submissions" ADD CONSTRAINT "ebook_submissions_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
