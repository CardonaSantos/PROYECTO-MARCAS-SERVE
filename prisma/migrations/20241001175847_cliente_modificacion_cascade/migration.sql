-- DropForeignKey
ALTER TABLE "SolicitudDescuento" DROP CONSTRAINT "SolicitudDescuento_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "SolicitudDescuento" DROP CONSTRAINT "SolicitudDescuento_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "UbicacionCliente" DROP CONSTRAINT "UbicacionCliente_clienteId_fkey";

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "categoriasInteres" TEXT[],
ADD COLUMN     "comentarios" TEXT,
ADD COLUMN     "preferenciaContacto" TEXT,
ADD COLUMN     "presupuestoMensual" TEXT,
ADD COLUMN     "tipoCliente" TEXT,
ADD COLUMN     "volumenCompra" TEXT;

-- AddForeignKey
ALTER TABLE "SolicitudDescuento" ADD CONSTRAINT "SolicitudDescuento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudDescuento" ADD CONSTRAINT "SolicitudDescuento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UbicacionCliente" ADD CONSTRAINT "UbicacionCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
