import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const periodos = [
      {
        id: 'diario',
        nome: 'Diário',
        descricao: 'Hoje',
        icone: 'CalendarIcon',
        ativo: true
      },
      {
        id: 'semanal',
        nome: 'Semanal',
        descricao: 'Esta semana',
        icone: 'ChartBarIcon',
        ativo: true
      },
      {
        id: 'mensal',
        nome: 'Mensal',
        descricao: 'Este mês',
        icone: 'ClockIcon',
        ativo: true
      },
      {
        id: 'total',
        nome: 'Total',
        descricao: 'Desde sempre',
        icone: 'FireIcon',
        ativo: true
      }
    ]

    return res.status(200).json({ periodos })
  } catch (error) {
    console.error('Erro ao buscar períodos:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 