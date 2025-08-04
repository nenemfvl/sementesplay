-- AlterTable
ALTER TABLE "parceiros" ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "tiktok" TEXT,
ADD COLUMN     "twitch" TEXT,
ADD COLUMN     "youtube" TEXT;

-- CreateTable
CREATE TABLE "configuracao_ciclos" (
    "id" TEXT NOT NULL,
    "dataInicioCiclo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataInicioSeason" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numeroSeason" INTEGER NOT NULL DEFAULT 1,
    "numeroCiclo" INTEGER NOT NULL DEFAULT 1,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAtualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_ciclos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranking_ciclo" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "pontuacao" INTEGER NOT NULL DEFAULT 0,
    "posicao" INTEGER NOT NULL,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ranking_ciclo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranking_season" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "pontuacao" INTEGER NOT NULL DEFAULT 0,
    "posicao" INTEGER NOT NULL,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ranking_season_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ranking_ciclo" ADD CONSTRAINT "ranking_ciclo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_season" ADD CONSTRAINT "ranking_season_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
