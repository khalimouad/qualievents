-- CreateTable
CREATE TABLE "EventSeries" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "heroImage" TEXT,
    "brochureUrl" TEXT,
    "themeColor" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "orgId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventSeries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventSeries_slug_key" ON "EventSeries"("slug");

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "seriesId" TEXT;
ALTER TABLE "Event" ADD COLUMN "brochureUrl" TEXT;

-- AddForeignKey
ALTER TABLE "EventSeries" ADD CONSTRAINT "EventSeries_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "EventSeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Index for typical access patterns
CREATE INDEX "Event_seriesId_idx" ON "Event"("seriesId");
