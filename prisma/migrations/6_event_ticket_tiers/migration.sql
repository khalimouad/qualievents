-- CreateTable
CREATE TABLE "EventTicketTier" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "inclusions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "capacity" INTEGER,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "availableFrom" TIMESTAMP(3),
    "availableUntil" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventTicketTier_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Subscriber" ADD COLUMN "tierId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "tierId" TEXT;

-- AddForeignKey
ALTER TABLE "EventTicketTier" ADD CONSTRAINT "EventTicketTier_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Subscriber" ADD CONSTRAINT "Subscriber_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "EventTicketTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "EventTicketTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Index for typical access patterns
CREATE INDEX "EventTicketTier_eventId_sortOrder_idx" ON "EventTicketTier"("eventId", "sortOrder");
