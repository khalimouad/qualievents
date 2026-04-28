-- CreateTable
CREATE TABLE "GroupBooking" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "tierId" TEXT,
    "payerName" TEXT NOT NULL,
    "payerEmail" TEXT NOT NULL,
    "payerPhone" TEXT,
    "companyName" TEXT,
    "vatNumber" TEXT,
    "billingAddress" TEXT,
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentId" TEXT,
    "invoiceUrl" TEXT,
    "invoiceNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupBooking_reference_key" ON "GroupBooking"("reference");
CREATE INDEX "GroupBooking_eventId_idx" ON "GroupBooking"("eventId");

-- AlterTable
ALTER TABLE "Subscriber" ADD COLUMN "groupBookingId" TEXT;

-- AddForeignKey
ALTER TABLE "GroupBooking" ADD CONSTRAINT "GroupBooking_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupBooking" ADD CONSTRAINT "GroupBooking_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "EventTicketTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GroupBooking" ADD CONSTRAINT "GroupBooking_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Subscriber" ADD CONSTRAINT "Subscriber_groupBookingId_fkey" FOREIGN KEY ("groupBookingId") REFERENCES "GroupBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
