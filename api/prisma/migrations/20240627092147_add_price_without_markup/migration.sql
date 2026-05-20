/*
  Warnings:

  - Added the required column `price_without_markup` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_without_markup` to the `booking_trip_passenger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_without_markup` to the `booking_trip_vehicle` table without a default value. This is not possible if the table is not empty.

*/
ALTER TABLE "temp_booking" ADD COLUMN     "price_without_markup" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "price_without_markup" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "booking_trip_passenger" ADD COLUMN     "price_without_markup" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "booking_trip_vehicle" ADD COLUMN     "price_without_markup" DOUBLE PRECISION;

UPDATE ayahay.temp_booking SET price_without_markup = total_price;
UPDATE ayahay.booking SET price_without_markup = total_price;
UPDATE ayahay.booking_trip_passenger SET price_without_markup = total_price;
UPDATE ayahay.booking_trip_vehicle SET price_without_markup = total_price;

ALTER TABLE ayahay.temp_booking ALTER COLUMN price_without_markup SET NOT NULL;
ALTER TABLE ayahay.booking ALTER COLUMN price_without_markup SET NOT NULL;
ALTER TABLE ayahay.booking_trip_passenger ALTER COLUMN price_without_markup SET NOT NULL;
ALTER TABLE ayahay.booking_trip_vehicle ALTER COLUMN price_without_markup SET NOT NULL;

