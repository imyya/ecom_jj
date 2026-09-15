-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_deliveryZoneId_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "deliveryZoneId" DROP NOT NULL,
ALTER COLUMN "deliveryAddress" DROP NOT NULL,
ALTER COLUMN "deliveryQuartier" DROP NOT NULL,
ALTER COLUMN "deliveryFee" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryZoneId_fkey" FOREIGN KEY ("deliveryZoneId") REFERENCES "DeliveryZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
