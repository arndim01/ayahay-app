-- AlterTable
ALTER TABLE "booking_trip_passenger" ADD COLUMN     "discount_type" TEXT;

UPDATE ayahay.booking_trip_passenger btp
SET discount_type = p.discount_type
FROM ayahay.passenger p
WHERE btp.passenger_id = p.id
    AND p.discount_type IS NOT NULL
;