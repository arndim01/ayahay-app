/*
  Warnings:

  - You are about to drop the column `address` on the `shipping_line` table. All the data in the column will be lost.
  - You are about to drop the column `fax_number` on the `shipping_line` table. All the data in the column will be lost.
  - You are about to drop the column `subsidiary` on the `shipping_line` table. All the data in the column will be lost.
  - You are about to drop the column `telephone_number` on the `shipping_line` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `port` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `shipping_line` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[api_key]` on the table `shipping_line` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shipping_line_id` to the `disbursement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_line_id` to the `notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `shipping_line` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_line_id` to the `voucher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "disbursement" ADD COLUMN     "shipping_line_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "shipping_line_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "rate_table_markup" ADD COLUMN     "markup_flat_cargo" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "markup_max_flat_cargo" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "markup_percent_cargo" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "shipping_line_id" INTEGER;

-- AlterTable
ALTER TABLE "rate_table_row" ADD COLUMN     "shipping_line_id" INTEGER;

-- AlterTable
ALTER TABLE "shipping_line" DROP COLUMN "address",
DROP COLUMN "fax_number",
DROP COLUMN "subsidiary",
DROP COLUMN "telephone_number",
ADD COLUMN     "api_key" TEXT,
ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "voucher" ADD COLUMN     "shipping_line_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "old_bookings" (
    "booking_id" TEXT,
    "trip_id" INTEGER,
    "passenger_id" INTEGER,
    "total_price" DOUBLE PRECISION,
    "role" TEXT
);

-- CreateTable
CREATE TABLE "old_passenger_bookings" (
    "booking_id" TEXT,
    "trip_id" INTEGER,
    "passenger_id" INTEGER,
    "total_price" DOUBLE PRECISION,
    "role" TEXT,
    "discount_flat" DOUBLE PRECISION,
    "discount_percent" DOUBLE PRECISION
);

-- CreateTable
CREATE TABLE "old_vehicle_bookings" (
    "booking_id" TEXT,
    "trip_id" INTEGER,
    "vehicle_id" INTEGER,
    "total_price" DOUBLE PRECISION,
    "role" TEXT,
    "discount_flat" DOUBLE PRECISION,
    "discount_percent" DOUBLE PRECISION
);

-- CreateTable
CREATE TABLE "passenger_information" (
    "id" TEXT NOT NULL,
    "shipping_line_id" INTEGER NOT NULL,
    "port_id" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "passenger_information_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "passenger_information_shipping_line_id_port_id_key" ON "passenger_information"("shipping_line_id", "port_id");

-- CreateIndex
CREATE UNIQUE INDEX "port_code_key" ON "port"("code");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_line_code_key" ON "shipping_line"("code");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_line_api_key_key" ON "shipping_line"("api_key");

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "shipping_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disbursement" ADD CONSTRAINT "disbursement_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "shipping_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher" ADD CONSTRAINT "voucher_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "shipping_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_table_row" ADD CONSTRAINT "rate_table_row_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "shipping_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_table_markup" ADD CONSTRAINT "rate_table_markup_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "shipping_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_information" ADD CONSTRAINT "passenger_information_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "shipping_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_information" ADD CONSTRAINT "passenger_information_port_id_fkey" FOREIGN KEY ("port_id") REFERENCES "port"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
