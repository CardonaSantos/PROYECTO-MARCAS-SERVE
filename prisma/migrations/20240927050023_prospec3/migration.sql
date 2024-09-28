-- CreateEnum
CREATE TYPE "EstadoProspecto" AS ENUM ('EN_PROSPECTO', 'FINALIZADO', 'CERRADO');

-- AlterTable
ALTER TABLE "Prospecto" ADD COLUMN     "estado" "EstadoProspecto" NOT NULL DEFAULT 'EN_PROSPECTO';
