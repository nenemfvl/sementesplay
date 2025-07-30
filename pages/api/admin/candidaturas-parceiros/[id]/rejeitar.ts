import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { id } = req.query
      const { motivo } = req.body

      const user = await prisma.usuario.findFirst({
        where: { nivel: '5' }
      })

      if (!user) {
        return res.status(403).json({ error: 'Acesso negado - Admin não encontrado' })
      }

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'ID da candidatura é obrigatório' })
      }

      if (!motivo || typeof motivo !== 'string') {
        return res.status(400).json({ error: 'Motivo da rejeição é obrigatório' })
      }

      const candidatura = await prisma.candidaturaParceiro.findUnique({
        where: { id },
        include: { usuario: true }
      })

      if (!candidatura) {
        return res.status(404).json({ error: 'Candidatura não encontrada' })
      }

      if (candidatura.status !== 'pendente') {
        return res.status(400).json({ error: 'Candidatura já foi processada' })
      }

      await prisma.$transaction(async (prisma) => {
        // Atualizar status da candidatura
        await prisma.candidaturaParceiro.update({
          where: { id },
          data: {
            status: 'rejeitada'
          }
        })

        // Criar notificação
        await prisma.notificacao.create({
          data: {
            usuarioId: candidatura.usuarioId,
            titulo: 'Candidatura Rejeitada',
            mensagem: `Sua candidatura para se tornar parceiro foi rejeitada. Motivo: ${motivo}. Você pode tentar novamente em 30 dias.`,
            tipo: 'erro',
            lida: false
          }
        })
      })

      res.status(200).json({ message: 'Candidatura rejeitada com sucesso' })

    } catch (error) {
      console.error('Erro ao rejeitar candidatura:', error)
      res.status(500).json({ error: 'Erro interno do servidor ao rejeitar candidatura' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 