-- AlterTable
ALTER TABLE "conteudos" ADD COLUMN     "dataRemocao" TIMESTAMP(3),
ADD COLUMN     "motivoRemocao" TEXT,
ADD COLUMN     "removido" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "conteudos_parceiros" ADD COLUMN     "dataRemocao" TIMESTAMP(3),
ADD COLUMN     "motivoRemocao" TEXT,
ADD COLUMN     "removido" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "parceiros" ADD COLUMN     "discord" TEXT,
ADD COLUMN     "urlConnect" TEXT;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "dataSuspensao" TIMESTAMP(3),
ADD COLUMN     "motivoSuspensao" TEXT,
ADD COLUMN     "suspenso" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "denuncias" (
    "id" TEXT NOT NULL,
    "denuncianteId" TEXT NOT NULL,
    "conteudoId" TEXT,
    "conteudoParceiroId" TEXT,
    "tipo" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "descricao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "prioridade" TEXT NOT NULL DEFAULT 'baixa',
    "observacoes" TEXT,
    "dataDenuncia" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataResolucao" TIMESTAMP(3),

    CONSTRAINT "denuncias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertencias" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "denunciaId" TEXT,

    CONSTRAINT "advertencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversas_suporte" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "titulo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aberta',
    "prioridade" TEXT NOT NULL DEFAULT 'normal',
    "categoria" TEXT,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAtualizacao" TIMESTAMP(3) NOT NULL,
    "dataFechamento" TIMESTAMP(3),

    CONSTRAINT "conversas_suporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens_suporte" (
    "id" TEXT NOT NULL,
    "conversaId" TEXT NOT NULL,
    "remetenteId" TEXT,
    "mensagem" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'usuario',
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "dataEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_suporte_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "denuncias" ADD CONSTRAINT "denuncias_denuncianteId_fkey" FOREIGN KEY ("denuncianteId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "denuncias" ADD CONSTRAINT "denuncias_conteudoId_fkey" FOREIGN KEY ("conteudoId") REFERENCES "conteudos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "denuncias" ADD CONSTRAINT "denuncias_conteudoParceiroId_fkey" FOREIGN KEY ("conteudoParceiroId") REFERENCES "conteudos_parceiros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertencias" ADD CONSTRAINT "advertencias_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertencias" ADD CONSTRAINT "advertencias_denunciaId_fkey" FOREIGN KEY ("denunciaId") REFERENCES "denuncias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversas_suporte" ADD CONSTRAINT "conversas_suporte_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens_suporte" ADD CONSTRAINT "mensagens_suporte_conversaId_fkey" FOREIGN KEY ("conversaId") REFERENCES "conversas_suporte"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens_suporte" ADD CONSTRAINT "mensagens_suporte_remetenteId_fkey" FOREIGN KEY ("remetenteId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
