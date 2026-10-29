-- AlterEnum
ALTER TYPE "PaymentProvider" ADD VALUE 'MANUAL';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "cancelReason" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Seller" ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "QuoteResponse_requestId_sellerId_key" ON "QuoteResponse"("requestId", "sellerId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;
