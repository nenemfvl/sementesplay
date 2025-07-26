-- CreateTable
CREATE TABLE "emblemas_usuarios" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "emblema" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "dataConquista" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emblemas_usuarios_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "emblemas_usuarios" ADD CONSTRAINT "emblemas_usuarios_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
