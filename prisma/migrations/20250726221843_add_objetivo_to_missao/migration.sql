/*
  Warnings:

  - Added the required column `objetivo` to the `missoes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "missoes" ADD COLUMN     "objetivo" INTEGER;

-- Atualizar valores existentes
UPDATE "missoes" SET "objetivo" = 1 WHERE "titulo" = 'Primeira Doação';
UPDATE "missoes" SET "objetivo" = 10 WHERE "titulo" = 'Doador Frequente';
UPDATE "missoes" SET "objetivo" = 5 WHERE "titulo" = 'Apoiador de Criadores';
UPDATE "missoes" SET "objetivo" = 1000 WHERE "titulo" = 'Doador Generoso';

-- Tornar a coluna NOT NULL após atualizar os valores
ALTER TABLE "missoes" ALTER COLUMN "objetivo" SET NOT NULL;
