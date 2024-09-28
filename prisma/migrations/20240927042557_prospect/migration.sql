/*
  Warnings:

  - You are about to drop the column `actividad` on the `Prospecto` table. All the data in the column will be lost.
  - You are about to drop the column `codigoPostal` on the `Prospecto` table. All the data in the column will be lost.
  - You are about to drop the column `nivelInteres` on the `Prospecto` table. All the data in the column will be lost.
  - You are about to drop the column `observaciones` on the `Prospecto` table. All the data in the column will be lost.
  - You are about to drop the column `referencia` on the `Prospecto` table. All the data in the column will be lost.
  - You are about to drop the column `tipoNegocio` on the `Prospecto` table. All the data in the column will be lost.
  - Added the required column `empresaTienda` to the `Prospecto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombreCompleto` to the `Prospecto` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoCliente" AS ENUM ('Minorista', 'Mayorista', 'Boutique', 'TiendaEnLinea', 'ClienteIndividual');

-- AlterTable
ALTER TABLE "Prospecto" DROP COLUMN "actividad",
DROP COLUMN "codigoPostal",
DROP COLUMN "nivelInteres",
DROP COLUMN "observaciones",
DROP COLUMN "referencia",
DROP COLUMN "tipoNegocio",
ADD COLUMN     "categoriasInteres" TEXT[],
ADD COLUMN     "comentarios" TEXT,
ADD COLUMN     "correo" TEXT,
ADD COLUMN     "empresaTienda" TEXT NOT NULL,
ADD COLUMN     "nombreCompleto" TEXT NOT NULL,
ADD COLUMN     "preferenciaContacto" TEXT,
ADD COLUMN     "presupuestoMensual" TEXT,
ADD COLUMN     "telefono" TEXT,
ADD COLUMN     "tipoCliente" "TipoCliente",
ADD COLUMN     "volumenCompra" TEXT,
ALTER COLUMN "inicio" SET DEFAULT CURRENT_TIMESTAMP;

-- DropEnum
DROP TYPE "TipoNegocio";
