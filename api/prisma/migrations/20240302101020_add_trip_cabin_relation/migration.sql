-- AddForeignKey
ALTER TABLE "booking_trip_passenger" ADD CONSTRAINT "booking_trip_passenger_trip_id_cabin_id_fkey" FOREIGN KEY ("trip_id", "cabin_id") REFERENCES "trip_cabin"("trip_id", "cabin_id") ON DELETE RESTRICT ON UPDATE CASCADE;
