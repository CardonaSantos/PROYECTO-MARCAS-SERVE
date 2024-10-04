-- DropForeignKey
ALTER TABLE "Asistencia" DROP CONSTRAINT "Asistencia_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Notificacion" DROP CONSTRAINT "Notificacion_destinatarioId_fkey";

-- DropForeignKey
ALTER TABLE "Notificacion" DROP CONSTRAINT "Notificacion_remitenteId_fkey";

-- DropForeignKey
ALTER TABLE "Prospecto" DROP CONSTRAINT "Prospecto_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Venta" DROP CONSTRAINT "Venta_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Visita" DROP CONSTRAINT "Visita_usuarioId_fkey";

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_remitenteId_fkey" FOREIGN KEY ("remitenteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prospecto" ADD CONSTRAINT "Prospecto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
