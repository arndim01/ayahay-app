/*
  Warnings:

  - You are about to drop the column `account_id` on the `passenger` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "contact_email" TEXT;

-- AlterTable
ALTER TABLE "passenger" DROP COLUMN "account_id";

-- AlterTable
ALTER TABLE "temp_booking" ADD COLUMN     "contact_email" TEXT;
