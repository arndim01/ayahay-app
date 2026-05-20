-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "cancellation_type" TEXT;

-- AlterTable
ALTER TABLE "booking_trip_passenger" ADD COLUMN     "removed_reason_type" TEXT;

ALTER TABLE "booking_trip_vehicle"
    ADD COLUMN "removed_reason" TEXT,
    ADD COLUMN "removed_reason_type" TEXT
;

UPDATE "booking"
    SET "cancellation_type" = 'NoFault'
    WHERE "failure_cancellation_remarks" IS NOT NULL
;

UPDATE "booking_trip_passenger"
    SET "removed_reason_type" = 'NoFault'
    WHERE "removed_reason" IS NOT NULL
;
