-- CreateTable
CREATE TABLE "PaymentSettings" (
    "id" TEXT NOT NULL,
    "orgId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'cinetpay',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "mode" TEXT NOT NULL DEFAULT 'TEST',
    "apiKeyEnc" TEXT,
    "siteIdEnc" TEXT,
    "secretKeyEnc" TEXT,
    "notifyUrl" TEXT,
    "returnUrl" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'XOF',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "PaymentSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentSettings_orgId_key" ON "PaymentSettings"("orgId");

-- AddForeignKey
ALTER TABLE "PaymentSettings" ADD CONSTRAINT "PaymentSettings_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
