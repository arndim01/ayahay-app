-- AlterTable
ALTER TABLE "shipping_line" ADD COLUMN     "address" TEXT,
ADD COLUMN     "fax_number" TEXT,
ADD COLUMN     "subsidiary" TEXT,
ADD COLUMN     "telephone_number" TEXT;

UPDATE "shipping_line"
    SET "subsidiary" = 'Tabuelan Sea Transport, Inc.',
    "address" = 'Manoling Bldg. V. Gullas St., San Roque Cebu City',
    "telephone_number" = '266-7178'
    WHERE "id" = 1;

UPDATE "shipping_line"
    SET "address" = 'Kimwa Compound, S. Albano St., Subangdaku, Mandaue City',
    "telephone_number" = '(032) 344-4251, 343-3753',
    "fax_number" = '(032) 344-4251'
    WHERE "id" = 2;

UPDATE "shipping_line"
    SET "address" = 'Mezzanine, unit 4, New Market Bldg, Kinasang-an Cebu City, Cebu City, Philippines',
    "telephone_number" = '(032) 517 4255'
    WHERE "id" = 3;

ALTER TABLE "shipping_line"
    ALTER COLUMN "address" SET NOT NULL,
    ALTER COLUMN "telephone_number" SET NOT NULL;