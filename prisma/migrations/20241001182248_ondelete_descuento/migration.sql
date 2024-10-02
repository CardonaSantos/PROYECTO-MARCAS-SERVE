-- DropForeignKey
ALTER TABLE "Descuento" DROP CONSTRAINT "Descuento_clienteId_fkey";

-- AddForeignKey
ALTER TABLE "Descuento" ADD CONSTRAINT "Descuento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
