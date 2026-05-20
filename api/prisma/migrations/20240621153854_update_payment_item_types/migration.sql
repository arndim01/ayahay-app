UPDATE ayahay.booking_payment_item
    SET "type" = 'AyahayMarkup'
    WHERE "type" = 'ServiceCharge'
;