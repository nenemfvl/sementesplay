import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Por enquanto, retornar dados mockados
    const estatisticas = {
      totalResgatado: 1225,
      totalPendente: 150,
      codigosUsados: 8,
      economiaTotal: 2450,
      resgatesMes: 3,
      mediaPorResgate: 153
    }

    return res.status(200).json({ estatisticas })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 