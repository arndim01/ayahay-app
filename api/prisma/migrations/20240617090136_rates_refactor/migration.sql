-- CreateTable
CREATE TABLE "rate_table" (
    "id" SERIAL NOT NULL,
    "shipping_line_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "rate_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_table_row" (
    "id" SERIAL NOT NULL,
    "rate_table_id" INTEGER NOT NULL,
    "cabin_id" INTEGER,
    "vehicle_type_id" INTEGER,
    "fare" DOUBLE PRECISION NOT NULL,
    "can_book_online" BOOLEAN NOT NULL,

    CONSTRAINT "rate_table_row_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_table_markup" (
    "id" SERIAL NOT NULL,
    "rate_table_id" INTEGER NOT NULL,
    "travel_agency_id" INTEGER,
    "client_id" INTEGER,
    "markup_flat" DOUBLE PRECISION NOT NULL,
    "markup_percent" DOUBLE PRECISION NOT NULL,
    "markup_max_flat" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "rate_table_markup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "account" ADD COLUMN "client_id" INTEGER;

-- AlterTable
ALTER TABLE "shipping_line_schedule" ADD COLUMN "rate_table_id" INTEGER;

-- AlterTable
ALTER TABLE "trip" ADD COLUMN "rate_table_id" INTEGER;

WITH aznar AS (
    (SELECT id FROM ayahay.shipping_line WHERE "name" = 'E.B. Aznar Shipping Corporation')
)
INSERT INTO ayahay.rate_table
    (
        shipping_line_id,
        "name"
    )
    (
        SELECT aznar.id, rate."name"
        FROM aznar
        INNER JOIN (
            VALUES ('Bogo <-> Palompon Rate Table'), ('Danao <-> Isabel Manoling 1 Rate Table'), ('Danao <-> Isabel Manoling 2 Rate Table'), ('Danao <-> Isabel Manoling 3 Rate Table')
        ) AS rate("name") ON true = true
    )
;

WITH jomalia AS (
    (SELECT id FROM ayahay.shipping_line WHERE "name" = 'Jomalia Shipping Corporation')
)
INSERT INTO ayahay.rate_table
    (
        shipping_line_id,
        "name"
    )
    (
        SELECT jomalia.id, rate."name"
        FROM jomalia
        INNER JOIN (
            VALUES ('Coron <-> El Nido Rate Table')
        ) AS rate("name") ON true = true
    )
;

WITH bogo_schedule AS (
    SELECT id
    FROM ayahay.shipping_line_schedule
    WHERE src_port_id = (SELECT id FROM ayahay.port WHERE "name" = 'Bogo')
    LIMIT 1
)
INSERT INTO ayahay.rate_table_row
    (
        rate_table_id,
        cabin_id,
        vehicle_type_id,
        fare,
        can_book_online
    )
    (
        SELECT (SELECT id FROM ayahay.rate_table WHERE "name" = 'Bogo <-> Palompon Rate Table'),
            sr.cabin_id, sr.vehicle_type_id, sr.fare, sr.can_book_online
        FROM ayahay.shipping_line_schedule_rate sr
        INNER JOIN ayahay.shipping_line_schedule s ON sr.schedule_id = s.id
        WHERE s.id IN (SELECT id FROM bogo_schedule)
    )
;

WITH danao_manoling_one_schedule AS (
    SELECT id
    FROM ayahay.shipping_line_schedule
    WHERE src_port_id = (SELECT id FROM ayahay.port WHERE "name" = 'Danao')
        AND ship_id = (SELECT id FROM ayahay.ship WHERE "name" = 'Manoling 1')
    LIMIT 1
)
INSERT INTO ayahay.rate_table_row
    (
        rate_table_id,
        cabin_id,
        vehicle_type_id,
        fare,
        can_book_online
    )
    (
        SELECT (SELECT id FROM ayahay.rate_table WHERE "name" = 'Danao <-> Isabel Manoling 1 Rate Table'),
            sr.cabin_id, sr.vehicle_type_id, sr.fare, sr.can_book_online
        FROM ayahay.shipping_line_schedule_rate sr
        INNER JOIN ayahay.shipping_line_schedule s ON sr.schedule_id = s.id
        WHERE s.id IN (SELECT id FROM danao_manoling_one_schedule)
    )
;

WITH danao_manoling_two_schedule AS (
    SELECT id
    FROM ayahay.shipping_line_schedule
    WHERE src_port_id = (SELECT id FROM ayahay.port WHERE "name" = 'Danao')
        AND ship_id = (SELECT id FROM ayahay.ship WHERE "name" = 'Manoling 2')
    LIMIT 1
)
INSERT INTO ayahay.rate_table_row
    (
        rate_table_id,
        cabin_id,
        vehicle_type_id,
        fare,
        can_book_online
    )
    (
        SELECT (SELECT id FROM ayahay.rate_table WHERE "name" = 'Danao <-> Isabel Manoling 2 Rate Table'),
            sr.cabin_id, sr.vehicle_type_id, sr.fare, sr.can_book_online
        FROM ayahay.shipping_line_schedule_rate sr
        INNER JOIN ayahay.shipping_line_schedule s ON sr.schedule_id = s.id
        WHERE s.id IN (SELECT id FROM danao_manoling_two_schedule)
    )
;

WITH danao_manoling_three_schedule AS (
    SELECT id
    FROM ayahay.shipping_line_schedule
    WHERE src_port_id = (SELECT id FROM ayahay.port WHERE "name" = 'Danao')
        AND ship_id = (SELECT id FROM ayahay.ship WHERE "name" = 'Manoling 3')
    LIMIT 1
)
INSERT INTO ayahay.rate_table_row
    (
        rate_table_id,
        cabin_id,
        vehicle_type_id,
        fare,
        can_book_online
    )
    (
        SELECT (SELECT id FROM ayahay.rate_table WHERE "name" = 'Danao <-> Isabel Manoling 3 Rate Table'),
            sr.cabin_id, sr.vehicle_type_id, sr.fare, sr.can_book_online
        FROM ayahay.shipping_line_schedule_rate sr
        INNER JOIN ayahay.shipping_line_schedule s ON sr.schedule_id = s.id
        WHERE s.id IN (SELECT id FROM danao_manoling_three_schedule)
    )
;

WITH coron_schedule AS (
    SELECT id
    FROM ayahay.shipping_line_schedule
    WHERE src_port_id = (SELECT id FROM ayahay.port WHERE "name" = 'Coron')
    LIMIT 1
)
INSERT INTO ayahay.rate_table_row
    (
        rate_table_id,
        cabin_id,
        vehicle_type_id,
        fare,
        can_book_online
    )
    (
        SELECT (SELECT id FROM ayahay.rate_table WHERE "name" = 'Coron <-> El Nido Rate Table'),
            sr.cabin_id, sr.vehicle_type_id, sr.fare, sr.can_book_online
        FROM ayahay.shipping_line_schedule_rate sr
        INNER JOIN ayahay.shipping_line_schedule s ON sr.schedule_id = s.id
        WHERE s.id IN (SELECT id FROM coron_schedule)
    )
;

UPDATE ayahay.shipping_line_schedule
    SET rate_table_id = (SELECT id FROM ayahay.rate_table WHERE "name" = 'Bogo <-> Palompon Rate Table')
    WHERE src_port_id IN (SELECT id FROM ayahay.port WHERE "name" = 'Bogo' OR "name" = 'Palompon')
;

UPDATE ayahay.shipping_line_schedule
    SET rate_table_id = (SELECT id FROM ayahay.rate_table WHERE "name" = 'Danao <-> Isabel Manoling 1 Rate Table')
    WHERE src_port_id IN (SELECT id FROM ayahay.port WHERE "name" = 'Danao' OR "name" = 'Isabel')
        AND ship_id = (SELECT id FROM ayahay.ship WHERE "name" = 'Manoling 1')
;

UPDATE ayahay.shipping_line_schedule
    SET rate_table_id = (SELECT id FROM ayahay.rate_table WHERE "name" = 'Danao <-> Isabel Manoling 2 Rate Table')
    WHERE src_port_id IN (SELECT id FROM ayahay.port WHERE "name" = 'Danao' OR "name" = 'Isabel')
        AND ship_id = (SELECT id FROM ayahay.ship WHERE "name" = 'Manoling 2')
;

UPDATE ayahay.shipping_line_schedule
    SET rate_table_id = (SELECT id FROM ayahay.rate_table WHERE "name" = 'Danao <-> Isabel Manoling 3 Rate Table')
    WHERE src_port_id IN (SELECT id FROM ayahay.port WHERE "name" = 'Danao' OR "name" = 'Isabel')
        AND ship_id = (SELECT id FROM ayahay.ship WHERE "name" = 'Manoling 3')
;

UPDATE ayahay.shipping_line_schedule
    SET rate_table_id = (SELECT id FROM ayahay.rate_table WHERE "name" = 'Coron <-> El Nido Rate Table')
    WHERE src_port_id IN (SELECT id FROM ayahay.port WHERE "name" = 'Coron' OR "name" = 'El Nido')
;

UPDATE ayahay.trip
    SET rate_table_id = (SELECT id FROM ayahay.rate_table WHERE "name" = 'Bogo <-> Palompon Rate Table')
    WHERE src_port_id IN (SELECT id FROM ayahay.port WHERE "name" = 'Bogo' OR "name" = 'Palompon')
;

UPDATE ayahay.trip
    SET rate_table_id = (SELECT id FROM ayahay.rate_table WHERE "name" = 'Danao <-> Isabel Manoling 1 Rate Table')
    WHERE src_port_id IN (SELECT id FROM ayahay.port WHERE "name" = 'Danao' OR "name" = 'Isabel')
        AND ship_id = (SELECT id FROM ayahay.ship WHERE "name" = 'Manoling 1')
;

UPDATE ayahay.trip
    SET rate_table_id = (SELECT id FROM ayahay.rate_table WHERE "name" = 'Danao <-> Isabel Manoling 2 Rate Table')
    WHERE src_port_id IN (SELECT id FROM ayahay.port WHERE "name" = 'Danao' OR "name" = 'Isabel')
        AND ship_id = (SELECT id FROM ayahay.ship WHERE "name" = 'Manoling 2')
;

UPDATE ayahay.trip
    SET rate_table_id = (SELECT id FROM ayahay.rate_table WHERE "name" = 'Danao <-> Isabel Manoling 3 Rate Table')
    WHERE src_port_id IN (SELECT id FROM ayahay.port WHERE "name" = 'Danao' OR "name" = 'Isabel')
        AND ship_id = (SELECT id FROM ayahay.ship WHERE "name" = 'Manoling 3')
;

UPDATE ayahay.trip
    SET rate_table_id = (SELECT id FROM ayahay.rate_table WHERE "name" = 'Coron <-> El Nido Rate Table')
    WHERE src_port_id IN (SELECT id FROM ayahay.port WHERE "name" = 'Coron' OR "name" = 'El Nido')
;

-- AlterTable
ALTER TABLE "trip_cabin" DROP COLUMN "adult_fare";

-- DropTable
DROP TABLE "shipping_line_schedule_rate";

-- DropTable
DROP TABLE "trip_vehicle_type";

-- AddForeignKey
ALTER TABLE "trip" ADD CONSTRAINT "trip_rate_table_id_fkey" FOREIGN KEY ("rate_table_id") REFERENCES "rate_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_line_schedule" ADD CONSTRAINT "shipping_line_schedule_rate_table_id_fkey" FOREIGN KEY ("rate_table_id") REFERENCES "rate_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_table" ADD CONSTRAINT "rate_table_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "shipping_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_table_row" ADD CONSTRAINT "rate_table_row_rate_table_id_fkey" FOREIGN KEY ("rate_table_id") REFERENCES "rate_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_table_row" ADD CONSTRAINT "rate_table_row_cabin_id_fkey" FOREIGN KEY ("cabin_id") REFERENCES "cabin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_table_row" ADD CONSTRAINT "rate_table_row_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_table_markup" ADD CONSTRAINT "rate_table_markup_rate_table_id_fkey" FOREIGN KEY ("rate_table_id") REFERENCES "rate_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_table_markup" ADD CONSTRAINT "rate_table_markup_travel_agency_id_fkey" FOREIGN KEY ("travel_agency_id") REFERENCES "travel_agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_table_markup" ADD CONSTRAINT "rate_table_markup_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "shipping_line_schedule" ALTER COLUMN "rate_table_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "trip" ALTER COLUMN "rate_table_id" SET NOT NULL;
