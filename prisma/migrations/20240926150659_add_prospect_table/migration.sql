/*
  Warnings:

  - A unique constraint covering the columns `[prospectoId]` on the table `Venta` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Venta" ADD COLUMN     "prospectoId" INTEGER;

-- CreateTable
CREATE TABLE "Prospecto" (
    "id" SERIAL NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3),
    "usuarioId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "reporte" TEXT,
    "ventaId" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prospecto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Venta_prospectoId_key" ON "Venta"("prospectoId");

-- AddForeignKey
ALTER TABLE "Prospecto" ADD CONSTRAINT "Prospecto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prospecto" ADD CONSTRAINT "Prospecto_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_prospectoId_fkey" FOREIGN KEY ("prospectoId") REFERENCES "Prospecto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
