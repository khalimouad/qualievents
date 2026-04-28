-- CreateTable
CREATE TABLE "NewsletterJob" (
    "id" TEXT NOT NULL,
    "newsletterId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "cursor" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastTickAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NewsletterJob_status_lastTickAt_idx" ON "NewsletterJob"("status", "lastTickAt");

-- AddForeignKey
ALTER TABLE "NewsletterJob" ADD CONSTRAINT "NewsletterJob_newsletterId_fkey" FOREIGN KEY ("newsletterId") REFERENCES "Newsletter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
