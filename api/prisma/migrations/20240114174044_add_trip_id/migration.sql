/*
  Warnings:

  - Added the required column `trip_id` to the `disbursement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "disbursement" ADD COLUMN     "trip_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "disbursement" ADD CONSTRAINT "disbursement_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
