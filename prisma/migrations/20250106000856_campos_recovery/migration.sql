-- AlterTable
ALTER TABLE "Proveedor" ALTER COLUMN "correo" DROP NOT NULL,
ALTER COLUMN "telefono" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "expiracionToken" TIMESTAMP(3),
ADD COLUMN     "tokenRecuperacion" TEXT;
