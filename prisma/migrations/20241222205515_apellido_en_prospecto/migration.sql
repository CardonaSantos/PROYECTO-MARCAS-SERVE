-- DropIndex
DROP INDEX "Cliente_correo_key";

-- AlterTable
ALTER TABLE "Cliente" ALTER COLUMN "correo" DROP NOT NULL;
