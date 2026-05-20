-- AlterTable
ALTER TABLE "account" ADD COLUMN     "api_key" TEXT,
ADD COLUMN     "travel_agency_id" INTEGER;

-- AlterTable
ALTER TABLE "booking_trip_passenger" ADD COLUMN     "preferred_cabin_id" INTEGER;

-- CreateTable
CREATE TABLE "travel_agency" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "travel_agency_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "booking_trip_passenger" ADD CONSTRAINT "booking_trip_passenger_preferred_cabin_id_fkey" FOREIGN KEY ("preferred_cabin_id") REFERENCES "cabin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_travel_agency_id_fkey" FOREIGN KEY ("travel_agency_id") REFERENCES "travel_agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
