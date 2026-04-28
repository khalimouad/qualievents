-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PARTICIPATION',
    "examPassed" BOOLEAN,
    "pdfUrl" TEXT,
    "verificationCode" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3),
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Certification_subscriberId_key" ON "Certification"("subscriberId");
CREATE UNIQUE INDEX "Certification_verificationCode_key" ON "Certification"("verificationCode");
CREATE INDEX "Certification_eventId_idx" ON "Certification"("eventId");

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
