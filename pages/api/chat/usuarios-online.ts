import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Por enquanto, retornar alguns usuários mockados
    // Em uma implementação real, você rastrearia usuários online
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        nivel: true
      },
      take: 10
    })

    return res.status(200).json({ usuarios })
  } catch (error) {
    console.error('Erro ao buscar usuários online:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 