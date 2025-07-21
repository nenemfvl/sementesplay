import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const conquistas = await prisma.conquista.findMany()
      return res.status(200).json(conquistas)
    }
    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error) {
    console.error('Erro ao buscar conquistas:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 