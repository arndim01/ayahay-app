/*
  Warnings:

  - A unique constraint covering the columns `[booking_id,trip_id,drives_vehicle_id]` on the table `booking_trip_passenger` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "booking_trip_passenger" ADD COLUMN     "drives_vehicle_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "booking_trip_passenger_booking_id_trip_id_drives_vehicle_id_key" ON "booking_trip_passenger"("booking_id", "trip_id", "drives_vehicle_id");

-- AddForeignKey
ALTER TABLE "booking_trip_passenger" ADD CONSTRAINT "booking_trip_passenger_booking_id_trip_id_drives_vehicle_i_fkey" FOREIGN KEY ("booking_id", "trip_id", "drives_vehicle_id") REFERENCES "booking_trip_vehicle"("booking_id", "trip_id", "vehicle_id") ON DELETE RESTRICT ON UPDATE CASCADE;
