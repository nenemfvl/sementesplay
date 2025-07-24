import { prisma } from './prisma'

export async function enviarNotificacao(usuarioId: string, tipo: string, titulo: string, mensagem: string) {
  return prisma.notificacao.create({
    data: {
      usuarioId,
      tipo,
      titulo,
      mensagem,
      lida: false
    }
  })
} 