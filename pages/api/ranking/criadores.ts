import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Buscar ranking de criadores baseado no total de doações recebidas
    const ranking = await prisma.$queryRaw`
      SELECT 
        c.id,
        u.nome,
        c.categoria,
        c.nivelAtual,
        c.seguidores,
        COUNT(d.id) as numeroDoacoes,
        COALESCE(SUM(d.quantidade), 0) as totalDoacoes
      FROM criadores c
      JOIN usuarios u ON c.usuarioId = u.id
      LEFT JOIN doacoes d ON c.id = d.criadorId
      GROUP BY c.id, u.nome, c.categoria, c.nivelAtual, c.seguidores
      ORDER BY totalDoacoes DESC, c.seguidores DESC
      LIMIT 50
    `

    return res.status(200).json({ ranking })
  } catch (error) {
    console.error('Erro ao buscar ranking de criadores:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 