/*
  Warnings:

  - Added the required column `created_at` to the `disbursement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by_account_id` to the `disbursement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "disbursement" ADD COLUMN     "created_at" TIMESTAMP(3),
ADD COLUMN     "created_by_account_id" TEXT;

-- AddForeignKey
ALTER TABLE "disbursement" ADD CONSTRAINT "disbursement_created_by_account_id_fkey" FOREIGN KEY ("created_by_account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

UPDATE "disbursement"
    SET "created_at" = '2020-01-01',
    "created_by_account_id" = (SELECT "id" FROM "account" WHERE "email" = 'josefarroyo007@gmail.com' LIMIT 1);

ALTER TABLE "disbursement"
    ALTER COLUMN "created_at" SET NOT NULL,
    ALTER COLUMN "created_by_account_id" SET NOT NULL;