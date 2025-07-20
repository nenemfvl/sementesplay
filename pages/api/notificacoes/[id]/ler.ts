import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ error: 'ID da notificação é obrigatório' })
    }

    const notificacao = await prisma.notificacao.update({
      where: {
        id: String(id)
      },
      data: {
        lida: true
      }
    })

    return res.status(200).json({ notificacao })
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 