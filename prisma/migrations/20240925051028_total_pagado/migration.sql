/*
  Warnings:

  - Added the required column `total_pagado` to the `EntregaStock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EntregaStock" ADD COLUMN     "total_pagado" INTEGER NOT NULL;
