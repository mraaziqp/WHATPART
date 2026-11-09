-- AlterTable: Add banking details to Seller
ALTER TABLE "Seller" ADD COLUMN IF NOT EXISTS "bankName" TEXT,
ADD COLUMN IF NOT EXISTS "bankAccount" TEXT,
ADD COLUMN IF NOT EXISTS "bankBranch" TEXT,
ADD COLUMN IF NOT EXISTS "bankAccountType" TEXT;

-- AlterTable: Add courierName to OrderItem
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "courierName" TEXT;

-- AlterTable: Add images array to Review
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateEnum: LedgerType
DO $$ BEGIN
    CREATE TYPE "LedgerType" AS ENUM ('ORDER_CREDIT', 'COMMISSION_DEBIT', 'PAYOUT_DEBIT', 'REFUND_DEBIT', 'ADJUSTMENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: LedgerStatus
DO $$ BEGIN
    CREATE TYPE "LedgerStatus" AS ENUM ('PENDING_CLEARANCE', 'AVAILABLE', 'SETTLED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: PayoutStatus
DO $$ BEGIN
    CREATE TYPE "PayoutStatus" AS ENUM ('REQUESTED', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable: seller_transaction
CREATE TABLE IF NOT EXISTS "seller_transaction" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "orderItemId" TEXT,
    "type" "LedgerType" NOT NULL,
    "status" "LedgerStatus" NOT NULL DEFAULT 'PENDING_CLEARANCE',
    "amountCents" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "availableAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seller_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable: seller_payout
CREATE TABLE IF NOT EXISTS "seller_payout" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'REQUESTED',
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "branchCode" TEXT NOT NULL,
    "adminNotes" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "seller_payout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "seller_transaction_reference_key" ON "seller_transaction"("reference");
CREATE INDEX IF NOT EXISTS "seller_transaction_sellerId_status_idx" ON "seller_transaction"("sellerId", "status");
CREATE INDEX IF NOT EXISTS "seller_transaction_orderItemId_idx" ON "seller_transaction"("orderItemId");

CREATE UNIQUE INDEX IF NOT EXISTS "seller_payout_reference_key" ON "seller_payout"("reference");
CREATE INDEX IF NOT EXISTS "seller_payout_sellerId_idx" ON "seller_payout"("sellerId");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "seller_transaction" ADD CONSTRAINT "seller_transaction_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "seller_transaction" ADD CONSTRAINT "seller_transaction_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "seller_payout" ADD CONSTRAINT "seller_payout_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
