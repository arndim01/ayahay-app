-- CreateTable
CREATE TABLE "trip" (
    "id" SERIAL NOT NULL,
    "ship_id" INTEGER NOT NULL,
    "shipping_line_id" INTEGER NOT NULL,
    "src_port_id" INTEGER NOT NULL,
    "dest_port_id" INTEGER NOT NULL,
    "departure_date" TIMESTAMP(3) NOT NULL,
    "reference_number" TEXT NOT NULL,
    "seat_selection" BOOLEAN NOT NULL DEFAULT false,
    "available_vehicle_capacity" INTEGER NOT NULL,
    "vehicle_capacity" INTEGER NOT NULL,
    "booking_start_date" TIMESTAMP(3) NOT NULL,
    "booking_cut_off_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_vehicle_type" (
    "trip_id" INTEGER NOT NULL,
    "vehicle_type_id" INTEGER NOT NULL,
    "fare" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "trip_vehicle_type_pkey" PRIMARY KEY ("trip_id","vehicle_type_id")
);

-- CreateTable
CREATE TABLE "trip_cabin" (
    "trip_id" INTEGER NOT NULL,
    "cabin_id" INTEGER NOT NULL,
    "seat_plan_id" INTEGER,
    "available_passenger_capacity" INTEGER NOT NULL,
    "passenger_capacity" INTEGER NOT NULL,
    "adult_fare" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "trip_cabin_pkey" PRIMARY KEY ("trip_id","cabin_id")
);

-- CreateTable
CREATE TABLE "ship" (
    "id" SERIAL NOT NULL,
    "shipping_line_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "recommended_vehicle_capacity" INTEGER NOT NULL,

    CONSTRAINT "ship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cabin" (
    "id" SERIAL NOT NULL,
    "ship_id" INTEGER NOT NULL,
    "cabin_type_id" INTEGER NOT NULL,
    "default_seat_plan_id" INTEGER,
    "name" TEXT NOT NULL,
    "recommended_passenger_capacity" INTEGER NOT NULL,

    CONSTRAINT "cabin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_plan" (
    "id" SERIAL NOT NULL,
    "shipping_line_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "row_count" INTEGER NOT NULL,
    "column_count" INTEGER NOT NULL,

    CONSTRAINT "seat_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat" (
    "id" SERIAL NOT NULL,
    "seat_plan_id" INTEGER NOT NULL,
    "seat_type_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "column" INTEGER NOT NULL,

    CONSTRAINT "seat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_line" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "shipping_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_line_schedule" (
    "id" SERIAL NOT NULL,
    "shipping_line_id" INTEGER NOT NULL,
    "src_port_id" INTEGER NOT NULL,
    "dest_port_id" INTEGER NOT NULL,
    "ship_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "departure_hour" INTEGER NOT NULL,
    "departure_minute" INTEGER NOT NULL,
    "days_before_booking_start" INTEGER NOT NULL,
    "days_before_booking_cut_off" INTEGER NOT NULL,

    CONSTRAINT "shipping_line_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_line_schedule_rate" (
    "id" SERIAL NOT NULL,
    "schedule_id" INTEGER NOT NULL,
    "cabin_id" INTEGER,
    "vehicle_type_id" INTEGER,
    "fare" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "shipping_line_schedule_rate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "port" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "port_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking" (
    "id" TEXT NOT NULL,
    "account_id" TEXT,
    "reference_no" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "booking_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_passenger" (
    "id" SERIAL NOT NULL,
    "booking_id" TEXT NOT NULL,
    "trip_id" INTEGER NOT NULL,
    "passenger_id" INTEGER NOT NULL,
    "cabin_id" INTEGER NOT NULL,
    "seat_id" INTEGER,
    "meal" TEXT,
    "total_price" DOUBLE PRECISION NOT NULL,
    "check_in_date" TIMESTAMP(3),

    CONSTRAINT "booking_passenger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passenger" (
    "id" SERIAL NOT NULL,
    "buddy_id" INTEGER,
    "account_id" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "civil_status" TEXT NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "discount_type" TEXT,

    CONSTRAINT "passenger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_vehicle" (
    "id" SERIAL NOT NULL,
    "booking_id" TEXT NOT NULL,
    "trip_id" INTEGER NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "check_in_date" TIMESTAMP(3),

    CONSTRAINT "booking_vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle" (
    "id" SERIAL NOT NULL,
    "account_id" TEXT,
    "vehicle_type_id" INTEGER NOT NULL,
    "plate_number" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "model_year" INTEGER NOT NULL,
    "official_receipt_url" TEXT NOT NULL,
    "certificate_of_registration_url" TEXT NOT NULL,

    CONSTRAINT "vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temp_booking" (
    "id" SERIAL NOT NULL,
    "account_id" TEXT,
    "total_price" DOUBLE PRECISION NOT NULL,
    "booking_type" TEXT NOT NULL,
    "payment_reference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "passengers_json" JSONB NOT NULL,
    "vehicles_json" JSONB NOT NULL,
    "payment_items_json" JSONB NOT NULL,

    CONSTRAINT "temp_booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "passenger_id" INTEGER,
    "shipping_line_id" INTEGER,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cabin_type" (
    "id" SERIAL NOT NULL,
    "shipping_line_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "cabin_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_type" (
    "id" SERIAL NOT NULL,
    "shipping_line_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "seat_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "trip_id" INTEGER,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "date_created" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_notification" (
    "account_id" TEXT NOT NULL,
    "notification_id" INTEGER NOT NULL,
    "is_read" BOOLEAN NOT NULL,

    CONSTRAINT "account_notification_pkey" PRIMARY KEY ("account_id","notification_id")
);

-- CreateTable
CREATE TABLE "vehicle_type" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "vehicle_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_item" (
    "id" SERIAL NOT NULL,
    "booking_id" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "booking_passenger_id" INTEGER,
    "booking_vehicle_id" INTEGER,

    CONSTRAINT "payment_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_passenger_id_key" ON "account"("passenger_id");

-- AddForeignKey
ALTER TABLE "trip" ADD CONSTRAINT "trip_ship_id_fkey" FOREIGN KEY ("ship_id") REFERENCES "ship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip" ADD CONSTRAINT "trip_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "shipping_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip" ADD CONSTRAINT "trip_src_port_id_fkey" FOREIGN KEY ("src_port_id") REFERENCES "port"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip" ADD CONSTRAINT "trip_dest_port_id_fkey" FOREIGN KEY ("dest_port_id") REFERENCES "port"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_vehicle_type" ADD CONSTRAINT "trip_vehicle_type_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_vehicle_type" ADD CONSTRAINT "trip_vehicle_type_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_cabin" ADD CONSTRAINT "trip_cabin_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_cabin" ADD CONSTRAINT "trip_cabin_cabin_id_fkey" FOREIGN KEY ("cabin_id") REFERENCES "cabin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_cabin" ADD CONSTRAINT "trip_cabin_seat_plan_id_fkey" FOREIGN KEY ("seat_plan_id") REFERENCES "seat_plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ship" ADD CONSTRAINT "ship_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "shipping_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabin" ADD CONSTRAINT "cabin_ship_id_fkey" FOREIGN KEY ("ship_id") REFERENCES "ship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabin" ADD CONSTRAINT "cabin_cabin_type_id_fkey" FOREIGN KEY ("cabin_type_id") REFERENCES "cabin_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabin" ADD CONSTRAINT "cabin_default_seat_plan_id_fkey" FOREIGN KEY ("default_seat_plan_id") REFERENCES "seat_plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_plan" ADD CONSTRAINT "seat_plan_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "shipping_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat" ADD CONSTRAINT "seat_seat_plan_id_fkey" FOREIGN KEY ("seat_plan_id") REFERENCES "seat_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat" ADD CONSTRAINT "seat_seat_type_id_fkey" FOREIGN KEY ("seat_type_id") REFERENCES "seat_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_line_schedule" ADD CONSTRAINT "shipping_line_schedule_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "shipping_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_line_schedule" ADD CONSTRAINT "shipping_line_schedule_src_port_id_fkey" FOREIGN KEY ("src_port_id") REFERENCES "port"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_line_schedule" ADD CONSTRAINT "shipping_line_schedule_dest_port_id_fkey" FOREIGN KEY ("dest_port_id") REFERENCES "port"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_line_schedule" ADD CONSTRAINT "shipping_line_schedule_ship_id_fkey" FOREIGN KEY ("ship_id") REFERENCES "ship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_line_schedule_rate" ADD CONSTRAINT "shipping_line_schedule_rate_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "shipping_line_schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_line_schedule_rate" ADD CONSTRAINT "shipping_line_schedule_rate_cabin_id_fkey" FOREIGN KEY ("cabin_id") REFERENCES "cabin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_line_schedule_rate" ADD CONSTRAINT "shipping_line_schedule_rate_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_passenger" ADD CONSTRAINT "booking_passenger_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_passenger" ADD CONSTRAINT "booking_passenger_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_passenger" ADD CONSTRAINT "booking_passenger_passenger_id_fkey" FOREIGN KEY ("passenger_id") REFERENCES "passenger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_passenger" ADD CONSTRAINT "booking_passenger_cabin_id_fkey" FOREIGN KEY ("cabin_id") REFERENCES "cabin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_passenger" ADD CONSTRAINT "booking_passenger_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger" ADD CONSTRAINT "passenger_buddy_id_fkey" FOREIGN KEY ("buddy_id") REFERENCES "passenger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_vehicle" ADD CONSTRAINT "booking_vehicle_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_vehicle" ADD CONSTRAINT "booking_vehicle_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_vehicle" ADD CONSTRAINT "booking_vehicle_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temp_booking" ADD CONSTRAINT "temp_booking_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_passenger_id_fkey" FOREIGN KEY ("passenger_id") REFERENCES "passenger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "shipping_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabin_type" ADD CONSTRAINT "cabin_type_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "shipping_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_type" ADD CONSTRAINT "seat_type_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "shipping_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_notification" ADD CONSTRAINT "account_notification_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_notification" ADD CONSTRAINT "account_notification_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_item" ADD CONSTRAINT "payment_item_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_item" ADD CONSTRAINT "payment_item_booking_passenger_id_fkey" FOREIGN KEY ("booking_passenger_id") REFERENCES "booking_passenger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_item" ADD CONSTRAINT "payment_item_booking_vehicle_id_fkey" FOREIGN KEY ("booking_vehicle_id") REFERENCES "booking_vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
