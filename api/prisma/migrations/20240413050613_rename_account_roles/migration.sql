UPDATE ayahay.account
SET "role" = 'ShippingLineAdmin'
WHERE "role" = 'Admin';

UPDATE ayahay.account
SET "role" = 'ShippingLineStaff'
WHERE "role" = 'Staff';