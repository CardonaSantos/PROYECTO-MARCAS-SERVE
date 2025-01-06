/*
  Warnings:

  - You are about to drop the column `latitud` on the `Proveedor` table. All the data in the column will be lost.
  - You are about to drop the column `longitud` on the `Proveedor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Proveedor" DROP COLUMN "latitud",
DROP COLUMN "longitud";
