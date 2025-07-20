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

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<TrendsData | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { metric = 'donations', timeRange = '7d' } = req.query

  const generateTrendData = (metric: string, timeRange: string): TrendPoint[] => {
    const dataPoints = timeRange === '1d' ? 24 : 
                      timeRange === '7d' ? 7 : 
                      timeRange === '30d' ? 30 : 
                      timeRange === '90d' ? 12 : 12

    const baseValue = metric === 'donations' ? 1000 :
                     metric === 'users' ? 500 :
                     metric === 'revenue' ? 5000 :
                     metric === 'engagement' ? 200 :
                     100

    const labels = timeRange === '1d' ? 
      Array.from({ length: 24 }, (_, i) => `${i}:00`) :
      timeRange === '7d' ? 
      ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] :
      timeRange === '30d' ? 
      Array.from({ length: 30 }, (_, i) => `${i + 1}`) :
      timeRange === '90d' ? 
      ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'] :
      ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

    return Array.from({ length: dataPoints }, (_, i) => ({
      label: labels[i] || `${i + 1}`,
      value: Math.round(baseValue + Math.random() * baseValue * 0.5 + Math.sin(i * 0.5) * baseValue * 0.3),
      timestamp: new Date(Date.now() - (dataPoints - i) * 24 * 60 * 60 * 1000).toISOString()
    }))
  }

  const data = generateTrendData(metric as string, timeRange as string)
  const total = data.reduce((sum, point) => sum + point.value, 0)
  const average = total / data.length
  const change = ((data[data.length - 1].value - data[0].value) / data[0].value) * 100

  const response: TrendsData = {
    metric: metric as string,
    timeRange: timeRange as string,
    data,
    total,
    change: Math.round(change * 100) / 100,
    average: Math.round(average * 100) / 100
  }

  // Simular delay de processamento
  setTimeout(() => {
    res.status(200).json(response)
  }, 300)
} 