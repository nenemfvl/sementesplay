/*
  Warnings:

  - Added the required column `tipo` to the `conquistas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "conquistas" ADD COLUMN     "recompensaXp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tipo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "conquistas_usuarios" ADD COLUMN     "concluida" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "progresso" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "dataConquista" DROP NOT NULL,
ALTER COLUMN "dataConquista" DROP DEFAULT;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "corPerfil" TEXT,
ADD COLUMN     "nivelUsuario" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "streakLogin" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "titulo" TEXT,
ADD COLUMN     "ultimoLogin" TIMESTAMP(3),
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "historico_xp" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "xpGanho" INTEGER NOT NULL,
    "xpAnterior" INTEGER NOT NULL,
    "xpPosterior" INTEGER NOT NULL,
    "nivelAnterior" INTEGER NOT NULL,
    "nivelPosterior" INTEGER NOT NULL,
    "fonte" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_xp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "historico_xp" ADD CONSTRAINT "historico_xp_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
