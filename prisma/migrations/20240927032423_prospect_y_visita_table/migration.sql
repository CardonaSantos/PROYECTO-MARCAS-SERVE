/*
  Warnings:

  - You are about to drop the column `latitud` on the `Prospecto` table. All the data in the column will be lost.
  - You are about to drop the column `longitud` on the `Prospecto` table. All the data in the column will be lost.
  - You are about to drop the column `reporte` on the `Prospecto` table. All the data in the column will be lost.
  - You are about to drop the column `ventaId` on the `Prospecto` table. All the data in the column will be lost.
  - You are about to drop the column `citaId` on the `Venta` table. All the data in the column will be lost.
  - You are about to drop the column `prospectoId` on the `Venta` table. All the data in the column will be lost.
  - You are about to drop the `Cita` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[visitaId]` on the table `Venta` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Cita" DROP CONSTRAINT "Cita_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Cita" DROP CONSTRAINT "Cita_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Venta" DROP CONSTRAINT "Venta_citaId_fkey";

-- DropForeignKey
ALTER TABLE "Venta" DROP CONSTRAINT "Venta_prospectoId_fkey";

-- DropIndex
DROP INDEX "Venta_citaId_key";

-- DropIndex
DROP INDEX "Venta_prospectoId_key";

-- AlterTable
ALTER TABLE "Prospecto" DROP COLUMN "latitud",
DROP COLUMN "longitud",
DROP COLUMN "reporte",
DROP COLUMN "ventaId",
ADD COLUMN     "codigoPostal" TEXT,
ADD COLUMN     "departamento" TEXT,
ADD COLUMN     "municipio" TEXT,
ADD COLUMN     "referencia" TEXT;

-- AlterTable
ALTER TABLE "Venta" DROP COLUMN "citaId",
DROP COLUMN "prospectoId",
ADD COLUMN     "visitaId" INTEGER;

-- DropTable
DROP TABLE "Cita";

-- CreateTable
CREATE TABLE "Visita" (
    "id" SERIAL NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3),
    "usuarioId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "observaciones" TEXT,
    "ventaId" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visita_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Visita_ventaId_key" ON "Visita"("ventaId");

-- CreateIndex
CREATE UNIQUE INDEX "Venta_visitaId_key" ON "Venta"("visitaId");

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_visitaId_fkey" FOREIGN KEY ("visitaId") REFERENCES "Visita"("id") ON DELETE SET NULL ON UPDATE CASCADE;
