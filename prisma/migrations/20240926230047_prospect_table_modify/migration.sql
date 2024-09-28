-- CreateEnum
CREATE TYPE "TipoNegocio" AS ENUM ('RESTAURANTE', 'TIENDA', 'OFICINA', 'FARMACIA', 'OTRO');

-- CreateEnum
CREATE TYPE "ActividadNegocio" AS ENUM ('VENTA_ROPA', 'VENTA_COMIDA', 'SERVICIO_TECNICO', 'CONSULTORIA', 'OTRO');

-- CreateEnum
CREATE TYPE "NivelInteres" AS ENUM ('MUY_BAJO', 'BAJO', 'MODERADO', 'ALTO', 'MUY_ALTO');

-- DropForeignKey
ALTER TABLE "Prospecto" DROP CONSTRAINT "Prospecto_clienteId_fkey";

-- AlterTable
ALTER TABLE "Prospecto" ADD COLUMN     "actividad" "ActividadNegocio",
ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "latitud" DOUBLE PRECISION,
ADD COLUMN     "longitud" DOUBLE PRECISION,
ADD COLUMN     "nivelInteres" "NivelInteres",
ADD COLUMN     "observaciones" TEXT,
ADD COLUMN     "tipoNegocio" "TipoNegocio",
ALTER COLUMN "clienteId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Prospecto" ADD CONSTRAINT "Prospecto_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
