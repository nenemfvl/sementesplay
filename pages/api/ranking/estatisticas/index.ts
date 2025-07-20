import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const estatisticas = {
      totalDoadores: 1250,
      totalCriadores: 450,
      sementesDistribuidas: 1250000,
      doacoesRealizadas: 15600,
      rankingAtualizado: new Date()
    }

    return res.status(200).json({ estatisticas })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 