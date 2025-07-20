-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'comum',
    "sementes" INTEGER NOT NULL DEFAULT 0,
    "nivel" TEXT NOT NULL DEFAULT 'comum',
    "pontuacao" INTEGER NOT NULL DEFAULT 0,
    "dataCriacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAtualizacao" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "criadores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "seguidores" INTEGER NOT NULL DEFAULT 0,
    "totalDoacoes" INTEGER NOT NULL DEFAULT 0,
    "nivelAtual" TEXT NOT NULL DEFAULT 'comum',
    "beneficios" TEXT NOT NULL,
    CONSTRAINT "criadores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "parceiros" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "nomeCidade" TEXT NOT NULL,
    "comissaoMensal" REAL NOT NULL,
    "totalVendas" REAL NOT NULL DEFAULT 0,
    "codigosGerados" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "parceiros_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sementes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricao" TEXT NOT NULL,
    CONSTRAINT "sementes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "doacoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "doadorId" TEXT NOT NULL,
    "criadorId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mensagem" TEXT,
    CONSTRAINT "doacoes_doadorId_fkey" FOREIGN KEY ("doadorId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "doacoes_criadorId_fkey" FOREIGN KEY ("criadorId") REFERENCES "criadores" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transacoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "codigoParceiro" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "codigos_cashback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parceiroId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "dataGeracao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataUso" DATETIME,
    CONSTRAINT "codigos_cashback_parceiroId_fkey" FOREIGN KEY ("parceiroId") REFERENCES "parceiros" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notificacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "criadores_usuarioId_key" ON "criadores"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "parceiros_usuarioId_key" ON "parceiros"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "codigos_cashback_codigo_key" ON "codigos_cashback"("codigo");
