import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const agora = new Date()
    const vinteQuatroHorasAtras = new Date(agora.getTime() - 24 * 60 * 60 * 1000)
    const seteDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)
    const trintaDiasAtras = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Verificar se há atividade recente em cada período
    const [atividadeDiaria, atividadeSemanal, atividadeMensal] = await Promise.all([
      prisma.doacao.count({
        where: { data: { gte: vinteQuatroHorasAtras } }
      }),
      prisma.doacao.count({
        where: { data: { gte: seteDiasAtras } }
      }),
      prisma.doacao.count({
        where: { data: { gte: trintaDiasAtras } }
      })
    ])

    const periodos = [
      {
        id: 'diario',
        nome: 'Diário',
        descricao: 'Últimas 24 horas',
        icone: '📅',
        ativo: atividadeDiaria > 0
      },
      {
        id: 'semanal',
        nome: 'Semanal',
        descricao: 'Últimos 7 dias',
        icone: '📊',
        ativo: atividadeSemanal > 0
      },
      {
        id: 'mensal',
        nome: 'Mensal',
        descricao: 'Últimos 30 dias',
        icone: '📈',
        ativo: atividadeMensal > 0
      },
      {
        id: 'total',
        nome: 'Total',
        descricao: 'Desde o início',
        icone: '🏆',
        ativo: true
      }
    ]

    return res.status(200).json({ periodos })
  } catch (error) {
    console.error('Erro ao buscar períodos:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 