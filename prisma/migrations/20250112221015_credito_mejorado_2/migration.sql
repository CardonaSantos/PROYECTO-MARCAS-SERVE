/*
  Warnings:

  - You are about to drop the column `diasEntrePagos` on the `Credito` table. All the data in the column will be lost.
  - You are about to drop the column `frecuenciaPago` on the `Credito` table. All the data in the column will be lost.
  - You are about to drop the column `plazo` on the `Credito` table. All the data in the column will be lost.
  - Added the required column `numeroCuotas` to the `Credito` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saldoPendiente` to the `Credito` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Credito" DROP COLUMN "diasEntrePagos",
DROP COLUMN "frecuenciaPago",
DROP COLUMN "plazo",
ADD COLUMN     "numeroCuotas" INTEGER NOT NULL,
ADD COLUMN     "saldoPendiente" DOUBLE PRECISION NOT NULL;
