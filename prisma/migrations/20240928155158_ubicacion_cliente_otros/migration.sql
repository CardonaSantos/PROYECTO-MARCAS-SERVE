/*
  Warnings:

  - You are about to drop the column `departamento` on the `Prospecto` table. All the data in the column will be lost.
  - You are about to drop the column `municipio` on the `Prospecto` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ubicacionId]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "departamentoId" INTEGER,
ADD COLUMN     "municipioId" INTEGER,
ADD COLUMN     "ubicacionId" INTEGER;

-- AlterTable
ALTER TABLE "Prospecto" DROP COLUMN "departamento",
DROP COLUMN "municipio",
ADD COLUMN     "departamentoId" INTEGER,
ADD COLUMN     "municipioId" INTEGER;

-- CreateTable
CREATE TABLE "UbicacionCliente" (
    "id" SERIAL NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "clienteId" INTEGER,

    CONSTRAINT "UbicacionCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Departamento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Departamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Municipio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "departamentoId" INTEGER NOT NULL,

    CONSTRAINT "Municipio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UbicacionCliente_clienteId_key" ON "UbicacionCliente"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "Departamento_nombre_key" ON "Departamento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Municipio_nombre_key" ON "Municipio"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_ubicacionId_key" ON "Cliente"("ubicacionId");

-- AddForeignKey
ALTER TABLE "Prospecto" ADD CONSTRAINT "Prospecto_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prospecto" ADD CONSTRAINT "Prospecto_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UbicacionCliente" ADD CONSTRAINT "UbicacionCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Municipio" ADD CONSTRAINT "Municipio_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
