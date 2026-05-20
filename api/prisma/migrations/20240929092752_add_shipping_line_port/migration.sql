-- CreateTable
CREATE TABLE "shipping_line_port" (
    "shipping_line_id" INTEGER NOT NULL,
    "port_id" INTEGER NOT NULL,

    CONSTRAINT "shipping_line_port_pkey" PRIMARY KEY ("shipping_line_id","port_id")
);

-- AddForeignKey
ALTER TABLE "shipping_line_port" ADD CONSTRAINT "shipping_line_port_shipping_line_id_fkey" FOREIGN KEY ("shipping_line_id") REFERENCES "shipping_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_line_port" ADD CONSTRAINT "shipping_line_port_port_id_fkey" FOREIGN KEY ("port_id") REFERENCES "port"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
