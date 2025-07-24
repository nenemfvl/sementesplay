import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Insight {
  id: string
  type: 'positive' | 'warning' | 'info' | 'trend'
  title: string
  description: string
  value?: string
  trend?: number
  priority: 'high' | 'medium' | 'low'
  timestamp: string
  category: string
  action?: string
}

interface InsightsData {
  insights: Insight[]
  summary: {
    positive: number
    warning: number
    info: number
    trend: number
    total: number
  }
  period: string
}

function getPeriodDates(period: string) {
  const now = new Date()
  let start: Date, prevStart: Date, prevEnd: Date
  switch (period) {
    case '1d':
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      prevStart = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
      prevEnd = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case '30d':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      prevStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
      prevEnd = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90d':
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      prevStart = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
      prevEnd = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case '1y':
      start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      prevStart = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000)
      prevEnd = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    case '7d':
    default:
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      prevStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      prevEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
  }
  return { start, prevStart, prevEnd }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InsightsData | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { period = '7d' } = req.query
  const { start, prevStart, prevEnd } = getPeriodDates(period as string)

  try {
    // Crescimento de doações
    const [
      totalDonations,
      prevTotalDonations,
      doacoes
    ] = await Promise.all([
      prisma.doacao.count({ where: { data: { gte: start } } }),
      prisma.doacao.count({ where: { data: { gte: prevStart, lt: prevEnd } } }),
      prisma.doacao.findMany({ where: { data: { gte: start } }, orderBy: { data: 'asc' } })
    ])
    const growth = prevTotalDonations === 0 ? 100 : ((totalDonations - prevTotalDonations) / prevTotalDonations) * 100

    // Horário de pico (hora com mais doações)
    let peakHour = null
    if (doacoes.length > 0) {
      const hours = Array(24).fill(0)
      doacoes.forEach(d => {
        const h = new Date(d.data).getHours()
        hours[h]++
      })
      const max = Math.max(...hours)
      const idx = hours.findIndex(v => v === max)
      peakHour = idx
    }

    // Criador destaque (mais recebeu doações)
    const topCriador = await prisma.doacao.groupBy({
      by: ['criadorId'],
      where: { data: { gte: start } },
      _sum: { quantidade: true },
      orderBy: { _sum: { quantidade: 'desc' } },
      take: 1
    })
    let criadorNome = null
    if (topCriador.length > 0) {
      const criador = await prisma.criador.findUnique({
        where: { id: topCriador[0].criadorId },
        include: { usuario: true }
      })
      criadorNome = criador?.usuario.nome || null
    }

    // Retenção de usuários (usuários que fizeram mais de uma doação no período)
    const doacoesUsuarios = await prisma.doacao.groupBy({
      by: ['doadorId'],
      where: { data: { gte: start } },
      _count: { id: true }
    })
    const retidos = doacoesUsuarios.filter(u => u._count.id > 1).length
    const totalUsuarios = doacoesUsuarios.length
    const retentionRate = totalUsuarios === 0 ? 0 : (retidos / totalUsuarios) * 100

    // Montar insights
    const insights: Insight[] = []
    if (totalDonations > 0) {
      insights.push({
        id: '1',
        type: growth >= 0 ? 'positive' : 'warning',
        title: growth >= 0 ? 'Crescimento de Doações' : 'Queda nas Doações',
        description: growth >= 0 ? `As doações cresceram ${growth.toFixed(1)}% em relação ao período anterior.` : `As doações caíram ${Math.abs(growth).toFixed(1)}% em relação ao período anterior.`,
        value: `${growth.toFixed(1)}%`,
        trend: growth,
        priority: 'high',
        timestamp: new Date().toISOString(),
        category: 'donations',
        action: growth >= 0 ? 'Monitorar tendência de crescimento' : 'Rever estratégias de engajamento'
      })
    }
    if (peakHour !== null) {
      insights.push({
        id: '2',
        type: 'trend',
        title: 'Horário de Pico',
        description: `Maior atividade de doações às ${peakHour}h.`,
        value: `${peakHour}:00`,
        priority: 'medium',
        timestamp: new Date().toISOString(),
        category: 'donations',
        action: 'Otimizar campanhas para o horário de pico'
      })
    }
    if (criadorNome) {
      insights.push({
        id: '3',
        type: 'info',
        title: 'Criador em Destaque',
        description: `O criador que mais recebeu doações foi ${criadorNome}.`,
        value: criadorNome,
        priority: 'medium',
        timestamp: new Date().toISOString(),
        category: 'creators',
        action: 'Promover criador em destaque'
      })
    }
    if (totalUsuarios > 0) {
      insights.push({
        id: '4',
        type: retentionRate < 50 ? 'warning' : 'positive',
        title: 'Retenção de Usuários',
        description: retentionRate < 50 ? `Apenas ${retentionRate.toFixed(1)}% dos usuários fizeram mais de uma doação.` : `Ótima retenção: ${retentionRate.toFixed(1)}% dos usuários doaram mais de uma vez!`,
        value: `${retentionRate.toFixed(1)}%`,
        priority: 'high',
        timestamp: new Date().toISOString(),
        category: 'users',
        action: retentionRate < 50 ? 'Rever estratégias de retenção' : 'Manter boas práticas'
      })
    }

    const summary = {
      positive: insights.filter(i => i.type === 'positive').length,
      warning: insights.filter(i => i.type === 'warning').length,
      info: insights.filter(i => i.type === 'info').length,
      trend: insights.filter(i => i.type === 'trend').length,
      total: insights.length
    }

    return res.status(200).json({ insights, summary, period: period as string })
  } catch (error) {
    console.error('Erro ao buscar insights analytics:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 