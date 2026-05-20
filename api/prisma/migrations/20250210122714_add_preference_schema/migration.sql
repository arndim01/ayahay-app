/*
  Warnings:

  - You are about to drop the column `shipping_line_id` on the `disbursement` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_line_id` on the `notification` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_line_id` on the `rate_table_markup` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_line_id` on the `rate_table_row` table. All the data in the column will be lost.
  - You are about to drop the column `api_key` on the `shipping_line` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `shipping_line` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_line_id` on the `voucher` table. All the data in the column will be lost.
  - You are about to drop the `passenger_information` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `address` to the `shipping_line` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telephone_number` to the `shipping_line` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ayahay"."disbursement" DROP CONSTRAINT "disbursement_shipping_line_id_fkey";

-- DropForeignKey
ALTER TABLE "ayahay"."notification" DROP CONSTRAINT "notification_shipping_line_id_fkey";

-- DropForeignKey
ALTER TABLE "ayahay"."passenger_information" DROP CONSTRAINT "passenger_information_port_id_fkey";

-- DropForeignKey
ALTER TABLE "ayahay"."passenger_information" DROP CONSTRAINT "passenger_information_shipping_line_id_fkey";

-- DropForeignKey
ALTER TABLE "ayahay"."rate_table_markup" DROP CONSTRAINT "rate_table_markup_shipping_line_id_fkey";

-- DropForeignKey
ALTER TABLE "ayahay"."rate_table_row" DROP CONSTRAINT "rate_table_row_shipping_line_id_fkey";

-- DropForeignKey
ALTER TABLE "ayahay"."voucher" DROP CONSTRAINT "voucher_shipping_line_id_fkey";

-- DropIndex
DROP INDEX "ayahay"."port_code_key";

-- DropIndex
DROP INDEX "ayahay"."shipping_line_api_key_key";

-- DropIndex
DROP INDEX "ayahay"."shipping_line_code_key";

-- AlterTable
ALTER TABLE "ayahay"."disbursement" DROP COLUMN "shipping_line_id";

-- AlterTable
ALTER TABLE "ayahay"."notification" DROP COLUMN "shipping_line_id";

-- AlterTable
ALTER TABLE "ayahay"."rate_table_markup" DROP COLUMN "shipping_line_id",
ALTER COLUMN "markup_flat_cargo" DROP NOT NULL,
ALTER COLUMN "markup_flat_cargo" DROP DEFAULT,
ALTER COLUMN "markup_max_flat_cargo" DROP NOT NULL,
ALTER COLUMN "markup_max_flat_cargo" DROP DEFAULT,
ALTER COLUMN "markup_percent_cargo" DROP NOT NULL,
ALTER COLUMN "markup_percent_cargo" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ayahay"."rate_table_row" DROP COLUMN "shipping_line_id";

-- AlterTable
ALTER TABLE "ayahay"."shipping_line" DROP COLUMN "api_key",
DROP COLUMN "code",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "fax_number" TEXT,
ADD COLUMN     "logo_filename" TEXT,
ADD COLUMN     "subsidiary" TEXT,
ADD COLUMN     "telephone_number" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ayahay"."shipping_line_schedule" ADD COLUMN     "booking_cut_off_hour" INTEGER,
ADD COLUMN     "booking_cut_off_min" INTEGER;

-- AlterTable
ALTER TABLE "ayahay"."voucher" DROP COLUMN "shipping_line_id";

-- DropTable
DROP TABLE "ayahay"."passenger_information";
