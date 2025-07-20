import type { NextApiRequest, NextApiResponse } from 'next'

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

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<InsightsData | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { period = '7d' } = req.query

  const generateInsights = (period: string): Insight[] => {
    const baseInsights: Insight[] = [
      {
        id: '1',
        type: 'positive',
        title: 'Crescimento Recorde',
        description: 'Doações aumentaram significativamente este período, o maior crescimento dos últimos meses.',
        value: '+25%',
        trend: 25,
        priority: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        category: 'donations',
        action: 'Monitorar tendência de crescimento'
      },
      {
        id: '2',
        type: 'trend',
        title: 'Horário de Pico Identificado',
        description: 'Maior atividade entre 20h e 22h. Considere programar eventos neste horário.',
        value: '20h-22h',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        category: 'engagement',
        action: 'Otimizar programação de eventos'
      },
      {
        id: '3',
        type: 'warning',
        title: 'Retenção de Usuários',
        description: 'Taxa de retenção caiu este período. Recomenda-se revisar estratégias de engajamento.',
        value: '-8%',
        trend: -8,
        priority: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        category: 'users',
        action: 'Implementar campanhas de retenção'
      },
      {
        id: '4',
        type: 'info',
        title: 'Novo Criador em Destaque',
        description: 'Criador recebeu mais doações que a média. Considere destacar em campanhas.',
        value: '+150%',
        trend: 150,
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        category: 'creators',
        action: 'Promover criador em destaque'
      },
      {
        id: '5',
        type: 'positive',
        title: 'Missões Efetivas',
        description: 'Sistema de missões aumentou engajamento. Continue incentivando participação.',
        value: '+40%',
        trend: 40,
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        category: 'missions',
        action: 'Expandir sistema de missões'
      },
      {
        id: '6',
        type: 'trend',
        title: 'Padrão de Doação',
        description: 'Usuários tendem a doar mais no final de semana. Otimize campanhas.',
        value: 'Fim de semana',
        priority: 'low',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        category: 'donations',
        action: 'Programar campanhas para fim de semana'
      },
      {
        id: '7',
        type: 'warning',
        title: 'Criadores Inativos',
        description: 'Alguns criadores não receberam doações. Considere suporte.',
        value: '15 criadores',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
        category: 'creators',
        action: 'Contatar criadores inativos'
      },
      {
        id: '8',
        type: 'info',
        title: 'Nova Categoria Popular',
        description: 'Categoria de gaming está crescendo rapidamente.',
        value: 'Gaming',
        priority: 'low',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        category: 'categories',
        action: 'Investir em criadores de gaming'
      }
    ]

    // Ajustar insights baseado no período
    const periodInsights = baseInsights.map(insight => {
      const adjustedTrend = insight.trend ? insight.trend + (Math.random() - 0.5) * 10 : undefined
      return {
        ...insight,
        trend: adjustedTrend,
        value: insight.value?.includes('%') ? 
          `${Math.round((adjustedTrend || 0) * 100) / 100}%` : insight.value
      }
    })

    // Retornar insights mais relevantes para o período
    return periodInsights.slice(0, period === '1d' ? 3 : period === '7d' ? 5 : 8)
  }

  const insights = generateInsights(period as string)
  
  const summary = {
    positive: insights.filter(i => i.type === 'positive').length,
    warning: insights.filter(i => i.type === 'warning').length,
    info: insights.filter(i => i.type === 'info').length,
    trend: insights.filter(i => i.type === 'trend').length,
    total: insights.length
  }

  const response: InsightsData = {
    insights,
    summary,
    period: period as string
  }

  // Simular delay de processamento
  setTimeout(() => {
    res.status(200).json(response)
  }, 600)
} 