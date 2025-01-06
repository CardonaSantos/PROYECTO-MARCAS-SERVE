/*
  Warnings:

  - You are about to drop the column `apelido` on the `Cliente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "apelido",
ADD COLUMN     "apellido" TEXT;
