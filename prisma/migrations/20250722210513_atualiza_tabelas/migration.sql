-- CreateTable
CREATE TABLE "conteudos" (
    "id" TEXT NOT NULL,
    "criadorId" TEXT NOT NULL,
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
    "compartilhamentos" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "conteudos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comentarios" (
    "id" TEXT NOT NULL,
    "conteudoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respostaAId" TEXT,

    CONSTRAINT "comentarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missoes" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "recompensa" INTEGER NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFim" TIMESTAMP(3),
    "criadorOnly" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "missoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missoes_usuarios" (
    "id" TEXT NOT NULL,
    "missaoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "progresso" INTEGER NOT NULL DEFAULT 0,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataConclusao" TIMESTAMP(3),

    CONSTRAINT "missoes_usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conquistas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "icone" TEXT NOT NULL,
    "criterio" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "conquistas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conquistas_usuarios" (
    "id" TEXT NOT NULL,
    "conquistaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "dataConquista" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conquistas_usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "missoes_usuarios_missaoId_usuarioId_key" ON "missoes_usuarios"("missaoId", "usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "conquistas_usuarios_conquistaId_usuarioId_key" ON "conquistas_usuarios"("conquistaId", "usuarioId");

-- AddForeignKey
ALTER TABLE "conteudos" ADD CONSTRAINT "conteudos_criadorId_fkey" FOREIGN KEY ("criadorId") REFERENCES "criadores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_conteudoId_fkey" FOREIGN KEY ("conteudoId") REFERENCES "conteudos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_respostaAId_fkey" FOREIGN KEY ("respostaAId") REFERENCES "comentarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missoes_usuarios" ADD CONSTRAINT "missoes_usuarios_missaoId_fkey" FOREIGN KEY ("missaoId") REFERENCES "missoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missoes_usuarios" ADD CONSTRAINT "missoes_usuarios_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conquistas_usuarios" ADD CONSTRAINT "conquistas_usuarios_conquistaId_fkey" FOREIGN KEY ("conquistaId") REFERENCES "conquistas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conquistas_usuarios" ADD CONSTRAINT "conquistas_usuarios_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
