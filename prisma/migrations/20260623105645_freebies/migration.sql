CREATE TABLE "freebies" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "fileUrl" TEXT,
    "thumbnail" TEXT,
    "category" TEXT,
    "customEmailBody" TEXT,
    "showLivePromo" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "freebies_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "freebies_slug_key" ON "freebies"("slug");

CREATE TABLE "freebie_submissions" (
    "id" TEXT NOT NULL,
    "freebieId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "contactId" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "freebie_submissions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "freebie_submissions_freebieId_createdAt_idx" ON "freebie_submissions"("freebieId", "createdAt");
CREATE INDEX "freebie_submissions_email_idx" ON "freebie_submissions"("email");
CREATE INDEX "freebie_submissions_contactId_idx" ON "freebie_submissions"("contactId");
ALTER TABLE "freebie_submissions" ADD CONSTRAINT "freebie_submissions_freebieId_fkey" FOREIGN KEY ("freebieId") REFERENCES "freebies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "freebie_submissions" ADD CONSTRAINT "freebie_submissions_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
