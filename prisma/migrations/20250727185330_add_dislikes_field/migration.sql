-- AlterTable
ALTER TABLE "conteudos" ADD COLUMN     "dislikes" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "interacoes_conteudo" (
    "id" TEXT NOT NULL,
    "conteudoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interacoes_conteudo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interacoes_conteudo_conteudoId_usuarioId_tipo_key" ON "interacoes_conteudo"("conteudoId", "usuarioId", "tipo");

-- AddForeignKey
ALTER TABLE "interacoes_conteudo" ADD CONSTRAINT "interacoes_conteudo_conteudoId_fkey" FOREIGN KEY ("conteudoId") REFERENCES "conteudos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interacoes_conteudo" ADD CONSTRAINT "interacoes_conteudo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
