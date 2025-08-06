import { prisma } from '../../../lib/prisma'


import type { NextApiRequest, NextApiResponse } from 'next'
interface Performer {
  id: string
  name: string
  type: 'creator' | 'donor'
  value: number
  change: number
  avatar: string
  category: string
  rank: number
}

interface PerformersData {
  creators: Performer[]
  donors: Performer[]
  period: string
}

function getPeriodDates(period: string) {
  const now = new Date()
  let start: Date
  switch (period) {
    case '1d':
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case '30d':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90d':
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case '1y':
      start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    case '7d':
    default:
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
  }
  return { start }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PerformersData | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { period = '7d' } = req.query
  const { start } = getPeriodDates(period as string)

  try {
    // Top Criadores (por valor recebido)
    const topCreatorsRaw = await prisma.doacao.groupBy({
      by: ['criadorId'],
      where: { data: { gte: start } },
      _sum: { quantidade: true },
      orderBy: { _sum: { quantidade: 'desc' } },
      take: 10
    })
    const criadorIds = topCreatorsRaw.map(c => c.criadorId)
    const criadores = await prisma.criador.findMany({
      where: { id: { in: criadorIds } },
      include: { usuario: true }
    })
    const topCreators: Performer[] = topCreatorsRaw.map((c, i) => {
      const criador = criadores.find(cr => cr.id === c.criadorId)
      return {
        id: criador?.id || '',
        name: criador?.usuario.nome || 'Desconhecido',
        type: 'creator',
        value: c._sum.quantidade || 0,
        change: 0, // Pode calcular variação se quiser
        avatar: '🎮',
        category: criador?.categoria || '',
        rank: i + 1
      }
    })

    // Top Doadores (por valor doado)
    const topDonorsRaw = await prisma.doacao.groupBy({
      by: ['doadorId'],
      where: { data: { gte: start } },
      _sum: { quantidade: true },
      orderBy: { _sum: { quantidade: 'desc' } },
      take: 10
    })
    const doadorIds = topDonorsRaw.map(d => d.doadorId)
    const doadores = await prisma.usuario.findMany({
      where: { id: { in: doadorIds } }
    })
    const topDonors: Performer[] = topDonorsRaw.map((d, i) => {
      const doador = doadores.find(u => u.id === d.doadorId)
      return {
        id: doador?.id || '',
        name: doador?.nome || 'Desconhecido',
        type: 'donor',
        value: d._sum.quantidade || 0,
        change: 0, // Pode calcular variação se quiser
        avatar: '👑',
        category: '',
        rank: i + 1
      }
    })

    return res.status(200).json({
      creators: topCreators,
      donors: topDonors,
      period: period as string
    })
  } catch (error) {
    console.error('Erro ao buscar performers analytics:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 