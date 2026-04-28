-- AlterTable: add event-type / format / rich content / streaming fields
ALTER TABLE "Event" ADD COLUMN "eventType" TEXT NOT NULL DEFAULT 'CONFERENCE';
ALTER TABLE "Event" ADD COLUMN "format" TEXT NOT NULL DEFAULT 'IN_PERSON';
ALTER TABLE "Event" ADD COLUMN "objectives" TEXT;
ALTER TABLE "Event" ADD COLUMN "targetAudience" TEXT;
ALTER TABLE "Event" ADD COLUMN "context" TEXT;
ALTER TABLE "Event" ADD COLUMN "platform" TEXT;
ALTER TABLE "Event" ADD COLUMN "streamUrl" TEXT;
ALTER TABLE "Event" ADD COLUMN "streamPasswordEnc" TEXT;
ALTER TABLE "Event" ADD COLUMN "streamInstructions" TEXT;
ALTER TABLE "Event" ADD COLUMN "recordingUrl" TEXT;

-- CreateTable: per-event programme sessions
CREATE TABLE "EventSession" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'SESSION',
    "day" INTEGER NOT NULL DEFAULT 1,
    "startTime" TEXT,
    "endTime" TEXT,
    "location" TEXT,
    "speakerName" TEXT,
    "streamUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventSession" ADD CONSTRAINT "EventSession_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes for typical access patterns
CREATE INDEX "EventSession_eventId_day_sortOrder_idx" ON "EventSession"("eventId", "day", "sortOrder");
