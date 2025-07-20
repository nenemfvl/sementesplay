import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { periodo } = req.query
    const periodoStr = String(periodo || '7d')

    // Calcular data de início baseada no período
    const agora = new Date()
    let dataInicio: Date

    switch (periodoStr) {
      case '7d':
        dataInicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        dataInicio = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        dataInicio = new Date(agora.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        dataInicio = new Date(agora.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        dataInicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Buscar top doadores
    const topDoadores = await prisma.$queryRaw`
      SELECT 
        u.nome,
        SUM(d.quantidade) as valor,
        COUNT(d.id) as quantidade
      FROM doacoes d
      JOIN usuarios u ON d.doadorId = u.id
      WHERE d.data >= ${dataInicio}
      GROUP BY d.doadorId, u.nome
      ORDER BY valor DESC
      LIMIT 5
    `

    // Buscar top criadores
    const topCriadores = await prisma.$queryRaw`
      SELECT 
        u.nome,
        SUM(d.quantidade) as recebido,
        COUNT(d.id) as doacoes
      FROM doacoes d
      JOIN criadores c ON d.criadorId = c.id
      JOIN usuarios u ON c.usuarioId = u.id
      WHERE d.data >= ${dataInicio}
      GROUP BY d.criadorId, u.nome
      ORDER BY recebido DESC
      LIMIT 5
    `

    // Buscar top cashbacks (mockado por enquanto)
    const topCashbacks = [
      { codigo: 'BONUS100', usos: 45, valor: 4500 },
      { codigo: 'WELCOME50', usos: 32, valor: 1600 },
      { codigo: 'SUMMER25', usos: 28, valor: 700 },
      { codigo: 'FESTIVAL75', usos: 15, valor: 1125 },
      { codigo: 'SPECIAL30', usos: 12, valor: 360 }
    ]

    const topDados = {
      topDoadores: topDoadores as any[],
      topCriadores: topCriadores as any[],
      topCashbacks
    }

    return res.status(200).json(topDados)
  } catch (error) {
    console.error('Erro ao buscar top dados:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 