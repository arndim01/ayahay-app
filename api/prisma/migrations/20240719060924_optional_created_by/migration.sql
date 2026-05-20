ALTER TABLE "booking_payment_item"
    ALTER COLUMN "created_by_account_id" DROP NOT NULL
;

ALTER TABLE "booking_payment_item" DROP CONSTRAINT "booking_payment_item_created_by_account_id_fkey";

ALTER TABLE "booking_payment_item" ADD CONSTRAINT "booking_payment_item_created_by_account_id_fkey" FOREIGN KEY ("created_by_account_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
