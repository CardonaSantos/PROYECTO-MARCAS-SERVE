-- DropForeignKey
ALTER TABLE "EntregaStock" DROP CONSTRAINT "EntregaStock_proveedorId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_proveedorId_fkey";

-- AlterTable
ALTER TABLE "EntregaStock" ALTER COLUMN "proveedorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Stock" ALTER COLUMN "proveedorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "EntregaStock" ADD CONSTRAINT "EntregaStock_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
