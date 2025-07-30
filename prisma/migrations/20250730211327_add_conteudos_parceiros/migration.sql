-- DropIndex
DROP INDEX "interacoes_conteudo_conteudoId_usuarioId_tipo_key";

-- AlterTable
ALTER TABLE "usuarios" ALTER COLUMN "tipo" SET DEFAULT 'usuario';

-- CreateTable
CREATE TABLE "conteudos_parceiros" (
    "id" TEXT NOT NULL,
    "parceiroId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT,
    "preview" TEXT,
    "fixado" BOOLEAN NOT NULL DEFAULT false,
    "dataPublicacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plataforma" TEXT NOT NULL,
    "visualizacoes" INTEGER NOT NULL DEFAULT 0,
    "curtidas" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "compartilhamentos" INTEGER NOT NULL DEFAULT 0,
    "cidade" TEXT NOT NULL,
    "endereco" TEXT,
    "dataEvento" TIMESTAMP(3),
    "preco" TEXT,
    "vagas" INTEGER,

    CONSTRAINT "conteudos_parceiros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comentarios_parceiros" (
    "id" TEXT NOT NULL,
    "conteudoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respostaAId" TEXT,

    CONSTRAINT "comentarios_parceiros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interacoes_conteudo_parceiros" (
    "id" TEXT NOT NULL,
    "conteudoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interacoes_conteudo_parceiros_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "conteudos_parceiros" ADD CONSTRAINT "conteudos_parceiros_parceiroId_fkey" FOREIGN KEY ("parceiroId") REFERENCES "parceiros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios_parceiros" ADD CONSTRAINT "comentarios_parceiros_conteudoId_fkey" FOREIGN KEY ("conteudoId") REFERENCES "conteudos_parceiros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios_parceiros" ADD CONSTRAINT "comentarios_parceiros_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios_parceiros" ADD CONSTRAINT "comentarios_parceiros_respostaAId_fkey" FOREIGN KEY ("respostaAId") REFERENCES "comentarios_parceiros"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interacoes_conteudo_parceiros" ADD CONSTRAINT "interacoes_conteudo_parceiros_conteudoId_fkey" FOREIGN KEY ("conteudoId") REFERENCES "conteudos_parceiros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interacoes_conteudo_parceiros" ADD CONSTRAINT "interacoes_conteudo_parceiros_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
