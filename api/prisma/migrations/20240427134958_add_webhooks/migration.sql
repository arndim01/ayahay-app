-- CreateTable
CREATE TABLE "webhook" (
    "id" SERIAL NOT NULL,
    "shipping_line_id" INTEGER,
    "travel_agency_id" INTEGER,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "webhook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "webhook_type_idx" ON "webhook" USING HASH ("type");

-- AddForeignKey
ALTER TABLE "webhook" ADD CONSTRAINT "webhook_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "shipping_line"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook" ADD CONSTRAINT "webhook_travel_agency_id_fkey" FOREIGN KEY ("travel_agency_id") REFERENCES "travel_agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
