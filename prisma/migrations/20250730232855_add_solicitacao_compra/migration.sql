-- AlterTable
ALTER TABLE "repasses_parceiro" ADD COLUMN     "paymentId" TEXT;

-- CreateTable
CREATE TABLE "solicitacoes_compra" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "parceiroId" TEXT NOT NULL,
    "valorCompra" DOUBLE PRECISION NOT NULL,
    "dataCompra" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comprovanteUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "cupomUsado" TEXT NOT NULL,
    "dataAprovacao" TIMESTAMP(3),
    "dataRejeicao" TIMESTAMP(3),
    "motivoRejeicao" TEXT,

    CONSTRAINT "solicitacoes_compra_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "solicitacoes_compra" ADD CONSTRAINT "solicitacoes_compra_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_compra" ADD CONSTRAINT "solicitacoes_compra_parceiroId_fkey" FOREIGN KEY ("parceiroId") REFERENCES "parceiros"("id") ON DELETE CASCADE ON UPDATE CASCADE;
