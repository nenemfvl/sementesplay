import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { usuarioId } = req.body

    if (!usuarioId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }

    const result = await prisma.notificacao.updateMany({
      where: {
        usuarioId: String(usuarioId),
        lida: false
      },
      data: {
        lida: true
      }
    })

    return res.status(200).json({ 
      message: 'Notificações marcadas como lidas',
      count: result.count
    })
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 