-- AlterTable
ALTER TABLE "parceiros" ADD COLUMN     "saldoDevedor" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "compras_parceiro" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "parceiroId" TEXT NOT NULL,
    "valorCompra" DOUBLE PRECISION NOT NULL,
    "dataCompra" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comprovanteUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aguardando_repasse',
    "cupomUsado" TEXT NOT NULL,

    CONSTRAINT "compras_parceiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repasses_parceiro" (
    "id" TEXT NOT NULL,
    "parceiroId" TEXT NOT NULL,
    "compraId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "dataRepasse" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comprovanteUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "usuarioId" TEXT,

    CONSTRAINT "repasses_parceiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fundo_sementes" (
    "id" TEXT NOT NULL,
    "ciclo" INTEGER NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "distribuido" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "fundo_sementes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distribuicoes_fundo" (
    "id" TEXT NOT NULL,
    "fundoId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "criadorId" TEXT,
    "valor" DOUBLE PRECISION NOT NULL,
    "tipo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distribuicoes_fundo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "repasses_parceiro_compraId_key" ON "repasses_parceiro"("compraId");

-- AddForeignKey
ALTER TABLE "compras_parceiro" ADD CONSTRAINT "compras_parceiro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras_parceiro" ADD CONSTRAINT "compras_parceiro_parceiroId_fkey" FOREIGN KEY ("parceiroId") REFERENCES "parceiros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repasses_parceiro" ADD CONSTRAINT "repasses_parceiro_parceiroId_fkey" FOREIGN KEY ("parceiroId") REFERENCES "parceiros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repasses_parceiro" ADD CONSTRAINT "repasses_parceiro_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "compras_parceiro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repasses_parceiro" ADD CONSTRAINT "repasses_parceiro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribuicoes_fundo" ADD CONSTRAINT "distribuicoes_fundo_fundoId_fkey" FOREIGN KEY ("fundoId") REFERENCES "fundo_sementes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribuicoes_fundo" ADD CONSTRAINT "distribuicoes_fundo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribuicoes_fundo" ADD CONSTRAINT "distribuicoes_fundo_criadorId_fkey" FOREIGN KEY ("criadorId") REFERENCES "criadores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
