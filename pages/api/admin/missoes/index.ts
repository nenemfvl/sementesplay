import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Buscar todas as missões (ativas e inativas)
      const missoes = await prisma.missao.findMany({
        orderBy: {
          dataCriacao: 'desc'
        }
      })

      const missoesFormatadas = missoes.map(missao => ({
        id: missao.id,
        titulo: missao.titulo,
        descricao: missao.descricao,
        objetivo: missao.objetivo,
        recompensa: missao.recompensa,
        tipo: missao.tipo,
        ativa: missao.ativa,
        dataCriacao: missao.dataCriacao,
        emblema: missao.emblema
      }))

      return res.status(200).json({ missoes: missoesFormatadas })
    } catch (error) {
      console.error('Erro ao buscar missões:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 