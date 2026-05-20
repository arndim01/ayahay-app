-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "voucher_code" TEXT;

-- AlterTable
ALTER TABLE "temp_booking" ADD COLUMN     "voucher_code" TEXT;

-- CreateTable
CREATE TABLE "voucher" (
    "code" TEXT NOT NULL,
    "created_by_account_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "discount_flat" DOUBLE PRECISION NOT NULL,
    "discount_percent" DOUBLE PRECISION NOT NULL,
    "number_of_uses" INTEGER,
    "remaining_uses" INTEGER,
    "expiry" TIMESTAMP(3) NOT NULL,
    "min_vehicles" INTEGER,

    CONSTRAINT "voucher_pkey" PRIMARY KEY ("code")
);

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_voucher_code_fkey" FOREIGN KEY ("voucher_code") REFERENCES "voucher"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temp_booking" ADD CONSTRAINT "temp_booking_voucher_code_fkey" FOREIGN KEY ("voucher_code") REFERENCES "voucher"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher" ADD CONSTRAINT "voucher_created_by_account_id_fkey" FOREIGN KEY ("created_by_account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
