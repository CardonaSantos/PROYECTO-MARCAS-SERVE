-- DropForeignKey
ALTER TABLE "Prospecto" DROP CONSTRAINT "Prospecto_clienteId_fkey";

-- AddForeignKey
ALTER TABLE "Prospecto" ADD CONSTRAINT "Prospecto_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
