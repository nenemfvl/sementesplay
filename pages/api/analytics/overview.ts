import type { NextApiRequest, NextApiResponse } from 'next'

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

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyticsOverview | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { period = '7d' } = req.query

  // Dados mockados baseados no período
  const mockData: Record<string, AnalyticsOverview> = {
    '1d': {
      totalDonations: 1542,
      totalUsers: 284,
      totalCreators: 15,
      totalRevenue: 4523,
      growthRate: 12.5,
      userGrowth: 8.3,
      creatorGrowth: 15.7,
      revenueGrowth: 22.1,
      period: '24h'
    },
    '7d': {
      totalDonations: 15420,
      totalUsers: 2847,
      totalCreators: 156,
      totalRevenue: 45230,
      growthRate: 12.5,
      userGrowth: 8.3,
      creatorGrowth: 15.7,
      revenueGrowth: 22.1,
      period: '7 dias'
    },
    '30d': {
      totalDonations: 65420,
      totalUsers: 12470,
      totalCreators: 456,
      totalRevenue: 189230,
      growthRate: 18.2,
      userGrowth: 12.7,
      creatorGrowth: 22.3,
      revenueGrowth: 28.9,
      period: '30 dias'
    },
    '90d': {
      totalDonations: 189420,
      totalUsers: 32470,
      totalCreators: 856,
      totalRevenue: 452230,
      growthRate: 25.1,
      userGrowth: 18.9,
      creatorGrowth: 31.2,
      revenueGrowth: 35.7,
      period: '90 dias'
    },
    '1y': {
      totalDonations: 654420,
      totalUsers: 124470,
      totalCreators: 2856,
      totalRevenue: 1452230,
      growthRate: 42.3,
      userGrowth: 38.7,
      creatorGrowth: 51.2,
      revenueGrowth: 58.9,
      period: '1 ano'
    }
  }

  const data = mockData[period as string] || mockData['7d']

  // Simular delay de processamento
  setTimeout(() => {
    res.status(200).json(data)
  }, 500)
} 