/*
  Warnings:

  - Added the required column `created_at` to the `booking_payment_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by_account_id` to the `booking_payment_item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "booking_payment_item" ADD COLUMN     "created_at" TIMESTAMP(3),
ADD COLUMN     "created_by_account_id" TEXT;

-- AddForeignKey
ALTER TABLE "booking_payment_item" ADD CONSTRAINT "booking_payment_item_created_by_account_id_fkey" FOREIGN KEY ("created_by_account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

UPDATE "booking_payment_item"
    SET "created_at" = '2020-01-01',
    "created_by_account_id" = (SELECT "id" FROM "account" WHERE "email" = 'josefarroyo007@gmail.com' LIMIT 1);

ALTER TABLE "booking_payment_item"
    ALTER COLUMN "created_at" SET NOT NULL,
    ALTER COLUMN "created_by_account_id" SET NOT NULL;