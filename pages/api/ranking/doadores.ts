import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Buscar ranking de doadores baseado no total de doações
    const ranking = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.nome,
        u.nivel,
        u.sementes,
        COUNT(d.id) as numeroDoacoes,
        COALESCE(SUM(d.quantidade), 0) as totalDoacoes
      FROM usuarios u
      LEFT JOIN doacoes d ON u.id = d.doadorId
      GROUP BY u.id, u.nome, u.nivel, u.sementes
      HAVING totalDoacoes > 0
      ORDER BY totalDoacoes DESC, numeroDoacoes DESC
      LIMIT 50
    `

    return res.status(200).json({ ranking })
  } catch (error) {
    console.error('Erro ao buscar ranking de doadores:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 