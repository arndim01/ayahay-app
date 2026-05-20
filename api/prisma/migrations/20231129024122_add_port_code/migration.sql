/*
  Warnings:

  - Added the required column `code` to the `port` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "port" ADD COLUMN     "code" TEXT NOT NULL;
