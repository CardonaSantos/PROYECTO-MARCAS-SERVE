/*
  Warnings:

  - You are about to drop the column `activo` on the `Usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Proveedor" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "ciudad" TEXT,
ADD COLUMN     "codigoPostal" TEXT,
ADD COLUMN     "coordenadas" DOUBLE PRECISION[],
ADD COLUMN     "emailContacto" TEXT,
ADD COLUMN     "nombreContacto" TEXT,
ADD COLUMN     "notas" TEXT,
ADD COLUMN     "pais" TEXT,
ADD COLUMN     "razonSocial" TEXT,
ADD COLUMN     "rfc" TEXT,
ADD COLUMN     "telefonoContacto" TEXT;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "activo";
