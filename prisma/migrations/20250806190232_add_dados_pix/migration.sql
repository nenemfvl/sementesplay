-- CreateTable
CREATE TABLE "dados_pix" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "chavePix" TEXT NOT NULL,
    "tipoChave" TEXT NOT NULL,
    "nomeTitular" TEXT NOT NULL,
    "cpfCnpj" TEXT NOT NULL,
    "validado" BOOLEAN NOT NULL DEFAULT false,
    "dataValidacao" TIMESTAMP(3),
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAtualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dados_pix_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dados_pix_usuarioId_key" ON "dados_pix"("usuarioId");

-- AddForeignKey
ALTER TABLE "dados_pix" ADD CONSTRAINT "dados_pix_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
