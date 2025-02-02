/*
  Warnings:

  - Added the required column `interes` to the `Credito` table without a default value. This is not possible if the table is not empty.
  - Added the required column `montoConInteres` to the `Credito` table without a default value. This is not possible if the table is not empty.
  - Made the column `ventaId` on table `Credito` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Credito" ADD COLUMN     "interes" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "montoConInteres" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "ventaId" SET NOT NULL;
