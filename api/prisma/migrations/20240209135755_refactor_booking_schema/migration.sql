-- CreateTable
CREATE TABLE "booking_trip" (
    "booking_id" TEXT NOT NULL,
    "trip_id" INTEGER NOT NULL,

    CONSTRAINT "booking_trip_pkey" PRIMARY KEY ("booking_id","trip_id"),
    CONSTRAINT "booking_trip_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "booking_trip_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "booking_trip_passenger" (
    "booking_id" TEXT NOT NULL,
    "trip_id" INTEGER NOT NULL,
    "passenger_id" INTEGER NOT NULL,
    "cabin_id" INTEGER NOT NULL,
    "seat_id" INTEGER,
    "meal" TEXT,
    "total_price" DOUBLE PRECISION NOT NULL,
    "check_in_date" TIMESTAMP(3),

    CONSTRAINT "booking_trip_passenger_pkey" PRIMARY KEY ("booking_id","trip_id","passenger_id"),
    CONSTRAINT "booking_trip_passenger_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "booking_trip_passenger_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "booking_trip_passenger_booking_id_trip_id_fkey" FOREIGN KEY ("booking_id", "trip_id") REFERENCES "booking_trip"("booking_id", "trip_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "booking_trip_passenger_passenger_id_fkey" FOREIGN KEY ("passenger_id") REFERENCES "passenger"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "booking_trip_passenger_cabin_id_fkey" FOREIGN KEY ("cabin_id") REFERENCES "cabin"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "booking_trip_passenger_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seat"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "booking_trip_vehicle" (
    "booking_id" TEXT NOT NULL,
    "trip_id" INTEGER NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "check_in_date" TIMESTAMP(3),

    CONSTRAINT "booking_trip_vehicle_pkey" PRIMARY KEY ("booking_id","trip_id","vehicle_id"),
    CONSTRAINT "booking_trip_vehicle_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "booking_trip_vehicle_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "booking_trip_vehicle_booking_id_trip_id_fkey" FOREIGN KEY ("booking_id", "trip_id") REFERENCES "booking_trip"("booking_id", "trip_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "booking_trip_vehicle_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "booking_payment_item" (
    "id" SERIAL NOT NULL,
    "booking_id" TEXT NOT NULL,
    "trip_id" INTEGER,
    "passenger_id" INTEGER,
    "vehicle_id" INTEGER,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "booking_payment_item_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "booking_payment_item_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "booking_payment_item_booking_id_trip_id_passenger_id_fkey" FOREIGN KEY ("booking_id", "trip_id", "passenger_id") REFERENCES "booking_trip_passenger"("booking_id", "trip_id", "passenger_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "booking_payment_item_booking_id_trip_id_vehicle_id_fkey" FOREIGN KEY ("booking_id", "trip_id", "vehicle_id") REFERENCES "booking_trip_vehicle"("booking_id", "trip_id", "vehicle_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO booking_trip (booking_id, trip_id)
    SELECT DISTINCT booking_id, trip_id
        FROM booking_passenger
    UNION
    SELECT DISTINCT booking_id, trip_id
        FROM booking_vehicle
;

INSERT INTO booking_trip_passenger (booking_id, trip_id, passenger_id, cabin_id, seat_id, meal, total_price, check_in_date)
    SELECT booking_id, trip_id, passenger_id, cabin_id, seat_id, meal, total_price, check_in_date
        FROM booking_passenger
;

INSERT INTO booking_trip_vehicle (booking_id, trip_id, vehicle_id, total_price, check_in_date)
    SELECT booking_id, trip_id, vehicle_id, total_price, check_in_date
        FROM booking_vehicle
;

INSERT INTO booking_payment_item (booking_id, price, description, type)
    SELECT booking_id, price, description, 'Miscellaneous'
        FROM payment_item
;

DROP TABLE "payment_item";

DROP TABLE "booking_passenger";

DROP TABLE "booking_vehicle";

TRUNCATE "temp_booking";

ALTER TABLE "temp_booking"
    DROP COLUMN "passengers_json",
    DROP COLUMN "vehicles_json",
    DROP COLUMN "payment_items_json",
    ADD COLUMN "booking_trips_json" JSONB NOT NULL,
    ADD COLUMN "booking_payment_items_json" JSONB NOT NULL
;

