/*
  Warnings:

  - Added the required column `diasEntrePagos` to the `Credito` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Credito" ADD COLUMN     "diasEntrePagos" DOUBLE PRECISION NOT NULL;
