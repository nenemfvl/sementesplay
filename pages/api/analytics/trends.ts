import { prisma } from '../../../lib/prisma'


import type { NextApiRequest, NextApiResponse } from 'next'
interface TrendPoint {
  label: string
  value: number
  timestamp: string
}

interface TrendsData {
  metric: string
  timeRange: string
  data: TrendPoint[]
  total: number
  change: number
  average: number
}

function getTimeRangeDates(timeRange: string) {
  const now = new Date()
  let start: Date, interval: 'hour' | 'day' | 'month', points: number, labels: string[]
  switch (timeRange) {
    case '1d':
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      interval = 'hour'
      points = 24
      labels = Array.from({ length: 24 }, (_, i) => `${i}:00`)
      break
    case '30d':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      interval = 'day'
      points = 30
      labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`)
      break
    case '90d':
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      interval = 'month'
      points = 12
      labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      break
    case '1y':
      start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      interval = 'month'
      points = 12
      labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      break
    case '7d':
    default:
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      interval = 'day'
      points = 7
      labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
      break
  }
  return { start, interval, points, labels }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TrendsData | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { metric = 'donations', timeRange = '7d' } = req.query
  const { start, interval, points, labels } = getTimeRangeDates(timeRange as string)

  try {
    let data: TrendPoint[] = []
    let total = 0
    let change = 0
    let average = 0

    if (metric === 'donations' || metric === 'revenue') {
      // Doações por período
      const doacoes = await prisma.doacao.findMany({
        where: { data: { gte: start } },
        orderBy: { data: 'asc' }
      })
      // Agrupar por intervalo
      const grouped = Array(points).fill(0)
      doacoes.forEach(d => {
        const date = new Date(d.data)
        let idx = 0
        if (interval === 'hour') {
          idx = date.getHours()
        } else if (interval === 'day') {
          const diff = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
          idx = Math.max(0, Math.min(points - 1, diff))
        } else if (interval === 'month') {
          idx = date.getMonth()
        }
        grouped[idx] += metric === 'donations' ? 1 : d.quantidade
      })
      data = grouped.map((value, i) => ({
        label: labels[i] || `${i + 1}`,
        value,
        timestamp: ''
      }))
      total = grouped.reduce((a, b) => a + b, 0)
      average = total / points
      change = points > 1 && grouped[0] > 0 ? ((grouped[points - 1] - grouped[0]) / grouped[0]) * 100 : 0
    } else if (metric === 'users') {
      // Novos usuários por período
      const usuarios = await prisma.usuario.findMany({
        where: { dataCriacao: { gte: start } },
        orderBy: { dataCriacao: 'asc' }
      })
      const grouped = Array(points).fill(0)
      usuarios.forEach(u => {
        const date = new Date(u.dataCriacao)
        let idx = 0
        if (interval === 'hour') {
          idx = date.getHours()
        } else if (interval === 'day') {
          const diff = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
          idx = Math.max(0, Math.min(points - 1, diff))
        } else if (interval === 'month') {
          idx = date.getMonth()
        }
        grouped[idx] += 1
      })
      data = grouped.map((value, i) => ({
        label: labels[i] || `${i + 1}`,
        value,
        timestamp: ''
      }))
      total = grouped.reduce((a, b) => a + b, 0)
      average = total / points
      change = points > 1 && grouped[0] > 0 ? ((grouped[points - 1] - grouped[0]) / grouped[0]) * 100 : 0
    } else if (metric === 'engagement') {
      // Engajamento: pode ser número de doações + novos usuários
      const doacoes = await prisma.doacao.findMany({ where: { data: { gte: start } } })
      const usuarios = await prisma.usuario.findMany({ where: { dataCriacao: { gte: start } } })
      const grouped = Array(points).fill(0)
      doacoes.forEach(d => {
        const date = new Date(d.data)
        let idx = 0
        if (interval === 'hour') {
          idx = date.getHours()
        } else if (interval === 'day') {
          const diff = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
          idx = Math.max(0, Math.min(points - 1, diff))
        } else if (interval === 'month') {
          idx = date.getMonth()
        }
        grouped[idx] += 1
      })
      usuarios.forEach(u => {
        const date = new Date(u.dataCriacao)
        let idx = 0
        if (interval === 'hour') {
          idx = date.getHours()
        } else if (interval === 'day') {
          const diff = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
          idx = Math.max(0, Math.min(points - 1, diff))
        } else if (interval === 'month') {
          idx = date.getMonth()
        }
        grouped[idx] += 1
      })
      data = grouped.map((value, i) => ({
        label: labels[i] || `${i + 1}`,
        value,
        timestamp: ''
      }))
      total = grouped.reduce((a, b) => a + b, 0)
      average = total / points
      change = points > 1 && grouped[0] > 0 ? ((grouped[points - 1] - grouped[0]) / grouped[0]) * 100 : 0
    }

    return res.status(200).json({
      metric: metric as string,
      timeRange: timeRange as string,
      data,
      total,
      change: Math.round(change * 100) / 100,
      average: Math.round(average * 100) / 100
    })
  } catch (error) {
    console.error('Erro ao buscar trends analytics:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 