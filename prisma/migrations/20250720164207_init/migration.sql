-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'comum',
    "sementes" INTEGER NOT NULL DEFAULT 0,
    "nivel" TEXT NOT NULL DEFAULT 'comum',
    "pontuacao" INTEGER NOT NULL DEFAULT 0,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAtualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carteiras_digitais" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "saldo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saldoPendente" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRecebido" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalSacado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAtualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carteiras_digitais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacoes_carteira" (
    "id" TEXT NOT NULL,
    "carteiraId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "saldoAnterior" DOUBLE PRECISION NOT NULL,
    "saldoPosterior" DOUBLE PRECISION NOT NULL,
    "descricao" TEXT NOT NULL,
    "referencia" TEXT,
    "status" TEXT NOT NULL DEFAULT 'processado',
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_carteira_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dados_bancarios" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "banco" TEXT NOT NULL,
    "agencia" TEXT NOT NULL,
    "conta" TEXT NOT NULL,
    "tipoConta" TEXT NOT NULL,
    "cpfCnpj" TEXT NOT NULL,
    "nomeTitular" TEXT NOT NULL,
    "validado" BOOLEAN NOT NULL DEFAULT false,
    "dataValidacao" TIMESTAMP(3),
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAtualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dados_bancarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saques" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "taxa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorLiquido" DOUBLE PRECISION NOT NULL,
    "dadosBancarios" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "motivoRejeicao" TEXT,
    "dataSolicitacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataProcessamento" TIMESTAMP(3),
    "dataConclusao" TIMESTAMP(3),
    "comprovante" TEXT,

    CONSTRAINT "saques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "sementesGeradas" INTEGER NOT NULL,
    "gateway" TEXT NOT NULL,
    "gatewayId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "dadosPagamento" TEXT NOT NULL,
    "dataPagamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataProcessamento" TIMESTAMP(3),

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "criadores" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "redesSociais" TEXT NOT NULL,
    "portfolio" TEXT NOT NULL,
    "nivel" TEXT NOT NULL DEFAULT 'comum',
    "sementes" INTEGER NOT NULL DEFAULT 0,
    "apoiadores" INTEGER NOT NULL DEFAULT 0,
    "doacoes" INTEGER NOT NULL DEFAULT 0,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "criadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidaturas_criador" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "redesSociais" TEXT NOT NULL,
    "portfolio" TEXT NOT NULL,
    "experiencia" TEXT NOT NULL,
    "motivacao" TEXT NOT NULL,
    "metas" TEXT NOT NULL,
    "disponibilidade" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "dataCandidatura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataRevisao" TIMESTAMP(3),
    "observacoes" TEXT,

    CONSTRAINT "candidaturas_criador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "detalhes" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nivel" TEXT NOT NULL DEFAULT 'info',

    CONSTRAINT "logs_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parceiros" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nomeCidade" TEXT NOT NULL,
    "comissaoMensal" DOUBLE PRECISION NOT NULL,
    "totalVendas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "codigosGerados" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "parceiros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sementes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "sementes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doacoes" (
    "id" TEXT NOT NULL,
    "doadorId" TEXT NOT NULL,
    "criadorId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mensagem" TEXT,

    CONSTRAINT "doacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacoes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "codigoParceiro" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codigos_cashback" (
    "id" TEXT NOT NULL,
    "parceiroId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "dataGeracao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataUso" TIMESTAMP(3),

    CONSTRAINT "codigos_cashback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_recuperacao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_recuperacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "carteiras_digitais_usuarioId_key" ON "carteiras_digitais"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "dados_bancarios_usuarioId_key" ON "dados_bancarios"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "criadores_usuarioId_key" ON "criadores"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "parceiros_usuarioId_key" ON "parceiros"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "codigos_cashback_codigo_key" ON "codigos_cashback"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_recuperacao_token_key" ON "tokens_recuperacao"("token");

-- AddForeignKey
ALTER TABLE "carteiras_digitais" ADD CONSTRAINT "carteiras_digitais_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_carteira" ADD CONSTRAINT "movimentacoes_carteira_carteiraId_fkey" FOREIGN KEY ("carteiraId") REFERENCES "carteiras_digitais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dados_bancarios" ADD CONSTRAINT "dados_bancarios_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saques" ADD CONSTRAINT "saques_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criadores" ADD CONSTRAINT "criadores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidaturas_criador" ADD CONSTRAINT "candidaturas_criador_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parceiros" ADD CONSTRAINT "parceiros_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sementes" ADD CONSTRAINT "sementes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doacoes" ADD CONSTRAINT "doacoes_doadorId_fkey" FOREIGN KEY ("doadorId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doacoes" ADD CONSTRAINT "doacoes_criadorId_fkey" FOREIGN KEY ("criadorId") REFERENCES "criadores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codigos_cashback" ADD CONSTRAINT "codigos_cashback_parceiroId_fkey" FOREIGN KEY ("parceiroId") REFERENCES "parceiros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens_recuperacao" ADD CONSTRAINT "tokens_recuperacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
