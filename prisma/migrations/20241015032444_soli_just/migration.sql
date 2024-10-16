/*
  Warnings:

  - Added the required column `justificacion` to the `SolicitudDescuento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Descuento" ADD COLUMN     "usado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SolicitudDescuento" ADD COLUMN     "justificacion" TEXT NOT NULL;
