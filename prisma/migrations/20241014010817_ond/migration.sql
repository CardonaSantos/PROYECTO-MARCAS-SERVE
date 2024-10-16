/*
  Warnings:

  - You are about to drop the column `ventaId` on the `Visita` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Visita_ventaId_key";

-- AlterTable
ALTER TABLE "Visita" DROP COLUMN "ventaId";
