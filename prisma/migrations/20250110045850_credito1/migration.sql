-- CreateEnum
CREATE TYPE "FrecuenciaPago" AS ENUM ('MENSUAL', 'QUINCENAL', 'SEMANAL');

-- CreateEnum
CREATE TYPE "EstadoCredito" AS ENUM ('ACTIVO', 'CERRADO');

-- AlterEnum
ALTER TYPE "MetodoPago" ADD VALUE 'CREDITO';

-- CreateTable
CREATE TABLE "IngresosEmpresa" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "saldoActual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ingresosTotales" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "egresosTotales" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "numeroVentas" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngresosEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credito" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER,
    "clienteId" INTEGER NOT NULL,
    "montoTotal" DOUBLE PRECISION NOT NULL,
    "saldoPendiente" DOUBLE PRECISION NOT NULL,
    "plazo" INTEGER NOT NULL,
    "frecuenciaPago" "FrecuenciaPago" NOT NULL,
    "estado" "EstadoCredito" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagoCredito" (
    "id" SERIAL NOT NULL,
    "creditoId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metodoPago" "MetodoPago" NOT NULL,

    CONSTRAINT "PagoCredito_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IngresosEmpresa_empresaId_key" ON "IngresosEmpresa"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Credito_ventaId_key" ON "Credito"("ventaId");

-- AddForeignKey
ALTER TABLE "IngresosEmpresa" ADD CONSTRAINT "IngresosEmpresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credito" ADD CONSTRAINT "Credito_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credito" ADD CONSTRAINT "Credito_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoCredito" ADD CONSTRAINT "PagoCredito_creditoId_fkey" FOREIGN KEY ("creditoId") REFERENCES "Credito"("id") ON DELETE CASCADE ON UPDATE CASCADE;
