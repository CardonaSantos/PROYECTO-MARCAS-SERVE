-- DropForeignKey
ALTER TABLE "Prospecto" DROP CONSTRAINT "Prospecto_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Visita" DROP CONSTRAINT "Visita_clienteId_fkey";

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prospecto" ADD CONSTRAINT "Prospecto_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
