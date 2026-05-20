/*
  Warnings:

  - A unique constraint covering the columns `[ship_id,src_port_id,dest_port_id,departure_date]` on the table `trip` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "trip_ship_id_src_port_id_dest_port_id_departure_date_key" ON "trip"("ship_id", "src_port_id", "dest_port_id", "departure_date");
