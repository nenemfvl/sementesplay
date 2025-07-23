-- CreateTable
CREATE TABLE "amizades" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "amigoId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "dataSolicitacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataResposta" TIMESTAMP(3),

    CONSTRAINT "amizades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversas" (
    "id" TEXT NOT NULL,
    "usuario1Id" TEXT NOT NULL,
    "usuario2Id" TEXT NOT NULL,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimaMensagem" TIMESTAMP(3),

    CONSTRAINT "conversas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens" (
    "id" TEXT NOT NULL,
    "conversaId" TEXT NOT NULL,
    "remetenteId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "dataEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enquetes" (
    "id" TEXT NOT NULL,
    "criadorId" TEXT NOT NULL,
    "pergunta" TEXT NOT NULL,
    "opcoes" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFim" TIMESTAMP(3),

    CONSTRAINT "enquetes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votos_enquetes" (
    "id" TEXT NOT NULL,
    "enqueteId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "opcaoIndex" INTEGER NOT NULL,
    "dataVoto" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votos_enquetes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recados" (
    "id" TEXT NOT NULL,
    "remetenteId" TEXT NOT NULL,
    "destinatarioId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lido" BOOLEAN NOT NULL DEFAULT false,
    "dataEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataLeitura" TIMESTAMP(3),

    CONSTRAINT "recados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "amizades_usuarioId_amigoId_key" ON "amizades"("usuarioId", "amigoId");

-- CreateIndex
CREATE UNIQUE INDEX "conversas_usuario1Id_usuario2Id_key" ON "conversas"("usuario1Id", "usuario2Id");

-- CreateIndex
CREATE UNIQUE INDEX "votos_enquetes_enqueteId_usuarioId_key" ON "votos_enquetes"("enqueteId", "usuarioId");

-- AddForeignKey
ALTER TABLE "amizades" ADD CONSTRAINT "amizades_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amizades" ADD CONSTRAINT "amizades_amigoId_fkey" FOREIGN KEY ("amigoId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversas" ADD CONSTRAINT "conversas_usuario1Id_fkey" FOREIGN KEY ("usuario1Id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversas" ADD CONSTRAINT "conversas_usuario2Id_fkey" FOREIGN KEY ("usuario2Id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_conversaId_fkey" FOREIGN KEY ("conversaId") REFERENCES "conversas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_remetenteId_fkey" FOREIGN KEY ("remetenteId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enquetes" ADD CONSTRAINT "enquetes_criadorId_fkey" FOREIGN KEY ("criadorId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votos_enquetes" ADD CONSTRAINT "votos_enquetes_enqueteId_fkey" FOREIGN KEY ("enqueteId") REFERENCES "enquetes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votos_enquetes" ADD CONSTRAINT "votos_enquetes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recados" ADD CONSTRAINT "recados_remetenteId_fkey" FOREIGN KEY ("remetenteId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recados" ADD CONSTRAINT "recados_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
