ALTER TABLE "booking"
    ADD COLUMN "is_booking_request" BOOLEAN,
    ADD COLUMN "shipping_line_id" INTEGER
;

ALTER TABLE "temp_booking"
    ADD COLUMN "is_booking_request" BOOLEAN,
    ADD COLUMN "shipping_line_id" INTEGER,
    ADD COLUMN "failure_cancellation_remarks" TEXT
;

UPDATE "booking"
    SET "is_booking_request" = FALSE,
        "shipping_line_id" = 1
;

UPDATE "temp_booking"
    SET "is_booking_request" = FALSE,
        "shipping_line_id" = 1
;

ALTER TABLE "booking"
    ALTER COLUMN "is_booking_request" SET NOT NULL
;

ALTER TABLE "booking"
    ALTER COLUMN "shipping_line_id" SET NOT NULL
;

ALTER TABLE "temp_booking"
    ALTER COLUMN "is_booking_request" SET NOT NULL
;

ALTER TABLE "temp_booking"
    ALTER COLUMN "shipping_line_id" SET NOT NULL
;

ALTER TABLE "booking"
    DROP CONSTRAINT "booking_account_id_fkey"
;

ALTER TABLE "temp_booking"
    DROP CONSTRAINT "temp_booking_account_id_fkey"
;

ALTER TABLE "booking"
    RENAME COLUMN "account_id" TO "created_by_account_id"
;

ALTER TABLE "temp_booking"
    RENAME COLUMN "account_id" TO "created_by_account_id"
;

ALTER TABLE "booking"
    ADD COLUMN "approved_by_account_id" TEXT
;

ALTER TABLE "temp_booking"
    ADD COLUMN "approved_by_account_id" TEXT
;

ALTER TABLE "booking"
    ADD CONSTRAINT "booking_created_by_account_id_fkey"
        FOREIGN KEY ("created_by_account_id")
            REFERENCES "account"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
;

ALTER TABLE "booking"
    ADD CONSTRAINT "booking_approved_by_account_id_fkey"
        FOREIGN KEY ("approved_by_account_id")
            REFERENCES "account"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
;

ALTER TABLE "booking"
    ADD CONSTRAINT "booking_shipping_line_id_fkey"
        FOREIGN KEY ("shipping_line_id")
            REFERENCES "shipping_line"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
;


ALTER TABLE "temp_booking"
    ADD CONSTRAINT "temp_booking_created_by_account_id_fkey"
        FOREIGN KEY ("created_by_account_id")
            REFERENCES "account"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
;

ALTER TABLE "temp_booking"
    ADD CONSTRAINT "temp_booking_approved_by_account_id_fkey"
        FOREIGN KEY ("approved_by_account_id")
            REFERENCES "account"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
;

ALTER TABLE "temp_booking"
    ADD CONSTRAINT "temp_booking_shipping_line_id_fkey"
        FOREIGN KEY ("shipping_line_id")
            REFERENCES "shipping_line"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
;