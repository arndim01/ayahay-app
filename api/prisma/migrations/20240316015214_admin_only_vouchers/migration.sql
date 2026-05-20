ALTER TABLE "voucher"
    ADD COLUMN "can_book_online" BOOLEAN
;

UPDATE "voucher"
    SET "can_book_online" = TRUE
;

ALTER TABLE "voucher"
    ALTER COLUMN "can_book_online" SET NOT NULL
;
