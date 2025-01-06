/*
  Warnings:

  - You are about to drop the column `appelido` on the `Cliente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "appelido",
ADD COLUMN     "apelido" TEXT;
