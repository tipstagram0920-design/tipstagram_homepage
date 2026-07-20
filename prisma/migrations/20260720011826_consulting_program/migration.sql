-- CreateTable
CREATE TABLE "consulting_enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consulting_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consulting_tasks" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "doneAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consulting_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "consulting_enrollments_userId_key" ON "consulting_enrollments"("userId");

-- CreateIndex
CREATE INDEX "consulting_tasks_enrollmentId_day_order_idx" ON "consulting_tasks"("enrollmentId", "day", "order");

-- AddForeignKey
ALTER TABLE "consulting_enrollments" ADD CONSTRAINT "consulting_enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consulting_tasks" ADD CONSTRAINT "consulting_tasks_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "consulting_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
