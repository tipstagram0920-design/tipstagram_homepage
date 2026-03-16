-- AlterTable
ALTER TABLE "email_templates" ADD COLUMN "productId" TEXT;

-- DropIndex
DROP INDEX "email_templates_type_key";

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_type_productId_key" ON "email_templates"("type", "productId");

-- AddForeignKey
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
