/*
  Warnings:

  - You are about to drop the column `saldoPendiente` on the `Credito` table. All the data in the column will be lost.
  - Added the required column `cuotaInicial` to the `Credito` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dpi` to the `Credito` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testigos` to the `Credito` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Credito" DROP COLUMN "saldoPendiente",
ADD COLUMN     "comentario" TEXT,
ADD COLUMN     "cuotaInicial" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "diasEntrePagos" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dpi" TEXT NOT NULL,
ADD COLUMN     "empresaId" INTEGER,
ADD COLUMN     "fechaContrato" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "montoTotalConInteres" DOUBLE PRECISION,
ADD COLUMN     "testigos" JSONB NOT NULL,
ADD COLUMN     "totalPagado" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Credito" ADD CONSTRAINT "Credito_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
