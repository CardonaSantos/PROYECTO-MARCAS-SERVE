-- DropForeignKey
ALTER TABLE "Ubicacion" DROP CONSTRAINT "Ubicacion_usuarioId_fkey";

-- AddForeignKey
ALTER TABLE "Ubicacion" ADD CONSTRAINT "Ubicacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
