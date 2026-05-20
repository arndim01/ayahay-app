-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "remarks" TEXT;

-- AlterTable
ALTER TABLE "temp_booking" ADD COLUMN     "remarks" TEXT;

INSERT INTO ayahay.voucher
    (code, created_by_account_id, description, discount_flat, discount_percent, expiry, can_book_online)
    SELECT
        'COLLECT_BOOKING',
        (SELECT id FROM ayahay.account WHERE "role" = 'SuperAdmin' LIMIT 1),
        'Collect booking voucher',
        0,
        1,
        CURRENT_TIMESTAMP + interval '1 year',
        false
    WHERE EXISTS
        (SELECT 1 FROM ayahay.account WHERE "role" = 'SuperAdmin')
    ON CONFLICT ON CONSTRAINT voucher_pkey DO NOTHING
;

UPDATE ayahay.booking
    SET voucher_code = 'COLLECT_BOOKING'
    WHERE voucher_code = 'AZNAR_COLLECT'
;