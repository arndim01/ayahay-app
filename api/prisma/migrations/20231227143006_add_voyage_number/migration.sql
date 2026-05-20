ALTER TABLE "trip" ADD COLUMN     "cancellation_reason" TEXT,
ADD COLUMN     "status" TEXT;

UPDATE "trip"
SET "status" =
    CASE WHEN "departure_date" <= NOW()
        THEN 'Arrived'
        ELSE 'Awaiting'
    END
;

ALTER TABLE "trip"
    ALTER COLUMN "status" SET NOT NULL
;

-- CreateTable
CREATE TABLE "voyage" (
    "id" SERIAL NOT NULL,
    "ship_id" INTEGER NOT NULL,
    "trip_id" INTEGER,
    "number" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT NOT NULL,

    CONSTRAINT "voyage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dry_dock" (
    "id" SERIAL NOT NULL,
    "ship_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dry_dock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "voyage_trip_id_key" ON "voyage"("trip_id");

-- AddForeignKey
ALTER TABLE "voyage" ADD CONSTRAINT "voyage_ship_id_fkey" FOREIGN KEY ("ship_id") REFERENCES "ship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voyage" ADD CONSTRAINT "voyage_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dry_dock" ADD CONSTRAINT "dry_dock_ship_id_fkey" FOREIGN KEY ("ship_id") REFERENCES "ship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
