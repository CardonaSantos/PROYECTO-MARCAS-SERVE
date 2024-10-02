/*
  Warnings:

  - A unique constraint covering the columns `[ubicacionId]` on the table `Prospecto` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Prospecto" ADD COLUMN     "ubicacionId" INTEGER;

-- CreateTable
CREATE TABLE "UbicacionProspecto" (
    "id" SERIAL NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "prospectoId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UbicacionProspecto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prospecto_ubicacionId_key" ON "Prospecto"("ubicacionId");

-- AddForeignKey
ALTER TABLE "Prospecto" ADD CONSTRAINT "Prospecto_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "UbicacionProspecto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
