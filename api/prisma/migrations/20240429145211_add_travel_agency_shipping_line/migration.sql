-- CreateTable
CREATE TABLE "travel_agency_shipping_line" (
    "travel_agency_id" INTEGER NOT NULL,
    "shipping_line_id" INTEGER NOT NULL,

    CONSTRAINT "travel_agency_shipping_line_pkey" PRIMARY KEY ("travel_agency_id","shipping_line_id")
);

-- AddForeignKey
ALTER TABLE "travel_agency_shipping_line" ADD CONSTRAINT "travel_agency_shipping_line_travel_agency_id_fkey" FOREIGN KEY ("travel_agency_id") REFERENCES "travel_agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_agency_shipping_line" ADD CONSTRAINT "travel_agency_shipping_line_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "shipping_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
