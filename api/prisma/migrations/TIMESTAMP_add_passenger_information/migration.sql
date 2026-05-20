-- CreateTable
CREATE TABLE "passenger_information" (
    "id" TEXT NOT NULL,
    "shipping_line_id" INTEGER NOT NULL,
    "port_id" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "passenger_information_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "passenger_information_shipping_line_id_port_id_key" ON "passenger_information"("shipping_line_id", "port_id");

-- AddForeignKey
ALTER TABLE "passenger_information" ADD CONSTRAINT "passenger_information_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "shipping_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger_information" ADD CONSTRAINT "passenger_information_port_id_fkey" FOREIGN KEY ("port_id") REFERENCES "port"("id") ON DELETE RESTRICT ON UPDATE CASCADE; 