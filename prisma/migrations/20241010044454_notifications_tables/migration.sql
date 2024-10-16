/*
  Warnings:

  - You are about to drop the column `destinatarioId` on the `Notificacion` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notificacion" DROP CONSTRAINT "Notificacion_destinatarioId_fkey";

-- AlterTable
ALTER TABLE "Notificacion" DROP COLUMN "destinatarioId",
ALTER COLUMN "remitenteId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "NotificacionesLeidas" (
    "id" SERIAL NOT NULL,
    "notificacionId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "leidoEn" TIMESTAMP(3),

    CONSTRAINT "NotificacionesLeidas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NotificacionesLeidas" ADD CONSTRAINT "NotificacionesLeidas_notificacionId_fkey" FOREIGN KEY ("notificacionId") REFERENCES "Notificacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificacionesLeidas" ADD CONSTRAINT "NotificacionesLeidas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
