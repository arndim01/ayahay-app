ALTER TABLE "shipping_line_schedule_rate"
    ADD COLUMN "can_book_online" BOOLEAN
;
UPDATE "shipping_line_schedule_rate"
    SET "can_book_online" = TRUE
;
ALTER TABLE "shipping_line_schedule_rate"
    ALTER COLUMN "can_book_online" SET NOT NULL
;

ALTER TABLE "trip_vehicle_type"
    ADD COLUMN "can_book_online" BOOLEAN
;
UPDATE "trip_vehicle_type"
    SET "can_book_online" = TRUE
;
ALTER TABLE "trip_vehicle_type"
    ALTER COLUMN "can_book_online" SET NOT NULL
;
