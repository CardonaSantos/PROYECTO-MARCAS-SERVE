-- DropForeignKey
ALTER TABLE "Credito" DROP CONSTRAINT "Credito_clienteId_fkey";

-- AlterTable
ALTER TABLE "Credito" ALTER COLUMN "ventaId" DROP NOT NULL,
ALTER COLUMN "clienteId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Credito" ADD CONSTRAINT "Credito_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
