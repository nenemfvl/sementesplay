import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface AnalyticsOverview {
  totalDonations: number
  totalUsers: number
  totalCreators: number
  totalRevenue: number
  growthRate: number
  userGrowth: number
  creatorGrowth: number
  revenueGrowth: number
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
  res: NextApiResponse<AnalyticsOverview | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { period = '7d' } = req.query
  const { start, prevStart, prevEnd } = getPeriodDates(period as string)

  try {
    // Período atual
    const [
      totalDonations,
      totalUsers,
      totalCreators,
      totalRevenue
    ] = await Promise.all([
      prisma.doacao.count({ where: { data: { gte: start } } }),
      prisma.usuario.count({ where: { dataCriacao: { gte: start } } }),
      prisma.criador.count({ where: { usuario: { dataCriacao: { gte: start } } } }),
      prisma.doacao.aggregate({ _sum: { quantidade: true }, where: { data: { gte: start } } })
    ])

    // Período anterior
    const [
      prevTotalDonations,
      prevTotalUsers,
      prevTotalCreators,
      prevTotalRevenue
    ] = await Promise.all([
      prisma.doacao.count({ where: { data: { gte: prevStart, lt: prevEnd } } }),
      prisma.usuario.count({ where: { dataCriacao: { gte: prevStart, lt: prevEnd } } }),
      prisma.criador.count({ where: { usuario: { dataCriacao: { gte: prevStart, lt: prevEnd } } } }),
      prisma.doacao.aggregate({ _sum: { quantidade: true }, where: { data: { gte: prevStart, lt: prevEnd } } })
    ])

    function percentChange(current: number, prev: number) {
      if (prev === 0) return current > 0 ? 100 : 0
      return ((current - prev) / prev) * 100
    }

    const overview: AnalyticsOverview = {
      totalDonations,
      totalUsers,
      totalCreators,
      totalRevenue: totalRevenue._sum.quantidade || 0,
      growthRate: percentChange(totalDonations, prevTotalDonations),
      userGrowth: percentChange(totalUsers, prevTotalUsers),
      creatorGrowth: percentChange(totalCreators, prevTotalCreators),
      revenueGrowth: percentChange(totalRevenue._sum.quantidade || 0, prevTotalRevenue._sum.quantidade || 0),
      period: period as string
    }

    return res.status(200).json(overview)
  } catch (error) {
    console.error('Erro ao buscar overview analytics:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 