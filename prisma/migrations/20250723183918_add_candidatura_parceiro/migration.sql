-- CreateTable
CREATE TABLE "candidaturas_parceiro" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "nomeCidade" TEXT NOT NULL,
    "siteCidade" TEXT,
    "descricao" TEXT NOT NULL,
    "experiencia" TEXT NOT NULL,
    "expectativa" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "dataCandidatura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataRevisao" TIMESTAMP(3),
    "observacoes" TEXT,

    CONSTRAINT "candidaturas_parceiro_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "candidaturas_parceiro" ADD CONSTRAINT "candidaturas_parceiro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
