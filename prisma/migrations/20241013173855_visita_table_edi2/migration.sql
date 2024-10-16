-- CreateEnum
CREATE TYPE "EstadoVisita" AS ENUM ('INICIADA', 'FINALIZADA', 'CANCELADA');

-- AlterTable
ALTER TABLE "Visita" ADD COLUMN     "estadoVisita" "EstadoVisita" NOT NULL DEFAULT 'INICIADA';
