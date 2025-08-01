/*
  Warnings:

  - You are about to drop the column `usuarioId` on the `repasses_parceiro` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "repasses_parceiro" DROP CONSTRAINT "repasses_parceiro_usuarioId_fkey";

-- AlterTable
ALTER TABLE "codigos_cashback" ADD COLUMN     "dataExpiracao" TIMESTAMP(3),
ADD COLUMN     "usuarioId" TEXT;

-- AlterTable
ALTER TABLE "repasses_parceiro" DROP COLUMN "usuarioId";

-- AddForeignKey
ALTER TABLE "codigos_cashback" ADD CONSTRAINT "codigos_cashback_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
