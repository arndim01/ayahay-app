-- CreateTable
CREATE TABLE "disbursement" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "official_receipt" TEXT,
    "paid_to" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "disbursement_pkey" PRIMARY KEY ("id")
);
