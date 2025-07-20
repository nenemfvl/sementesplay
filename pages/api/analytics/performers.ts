import type { NextApiRequest, NextApiResponse } from 'next'

interface Performer {
  id: number
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

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PerformersData | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { period = '7d' } = req.query

  const topCreators: Performer[] = [
    { id: 1, name: 'JoãoGamer', type: 'creator', value: 15420, change: 12.5, avatar: '🎮', category: 'Gaming', rank: 1 },
    { id: 2, name: 'MariaStream', type: 'creator', value: 12850, change: 8.3, avatar: '🎵', category: 'Music', rank: 2 },
    { id: 3, name: 'PedroFiveM', type: 'creator', value: 9870, change: 15.7, avatar: '🚗', category: 'Gaming', rank: 3 },
    { id: 4, name: 'AnaArt', type: 'creator', value: 7650, change: 22.1, avatar: '🎨', category: 'Art', rank: 4 },
    { id: 5, name: 'CarlosTech', type: 'creator', value: 6540, change: 5.2, avatar: '💻', category: 'Tech', rank: 5 },
    { id: 6, name: 'LucasCraft', type: 'creator', value: 5430, change: 18.9, avatar: '⛏️', category: 'Gaming', rank: 6 },
    { id: 7, name: 'JuliaCooks', type: 'creator', value: 4320, change: 11.3, avatar: '👩‍🍳', category: 'Cooking', rank: 7 },
    { id: 8, name: 'RobertoFitness', type: 'creator', value: 3980, change: 7.8, avatar: '💪', category: 'Fitness', rank: 8 },
    { id: 9, name: 'FernandaBeauty', type: 'creator', value: 3650, change: 14.2, avatar: '💄', category: 'Beauty', rank: 9 },
    { id: 10, name: 'ThiagoTravel', type: 'creator', value: 3320, change: 9.6, avatar: '✈️', category: 'Travel', rank: 10 }
  ]

  const topDonors: Performer[] = [
    { id: 1, name: 'DoadorVIP', type: 'donor', value: 5000, change: 18.5, avatar: '👑', category: 'VIP', rank: 1 },
    { id: 2, name: 'ApoiadorFiel', type: 'donor', value: 3200, change: 12.3, avatar: '💎', category: 'Gold', rank: 2 },
    { id: 3, name: 'FãDedicado', type: 'donor', value: 2800, change: 8.7, avatar: '⭐', category: 'Silver', rank: 3 },
    { id: 4, name: 'NovoApoiador', type: 'donor', value: 2100, change: 25.1, avatar: '🌱', category: 'Bronze', rank: 4 },
    { id: 5, name: 'DoadorRegular', type: 'donor', value: 1800, change: 3.2, avatar: '💫', category: 'Regular', rank: 5 },
    { id: 6, name: 'ApoiadorAnônimo', type: 'donor', value: 1650, change: 15.8, avatar: '🎭', category: 'Anonymous', rank: 6 },
    { id: 7, name: 'FãPremium', type: 'donor', value: 1420, change: 6.9, avatar: '🏆', category: 'Premium', rank: 7 },
    { id: 8, name: 'DoadorEspecial', type: 'donor', value: 1280, change: 11.4, avatar: '🌟', category: 'Special', rank: 8 },
    { id: 9, name: 'ApoiadorAtivo', type: 'donor', value: 1150, change: 4.7, avatar: '⚡', category: 'Active', rank: 9 },
    { id: 10, name: 'FãRecente', type: 'donor', value: 980, change: 22.3, avatar: '🆕', category: 'New', rank: 10 }
  ]

  // Ajustar valores baseado no período
  const periodMultiplier = period === '1d' ? 0.14 : 
                          period === '7d' ? 1 : 
                          period === '30d' ? 4.3 : 
                          period === '90d' ? 12.9 : 52.1

  const adjustValues = (performers: Performer[]): Performer[] => {
    return performers.map(performer => ({
      ...performer,
      value: Math.round(performer.value * periodMultiplier),
      change: performer.change + (Math.random() - 0.5) * 10 // Variação aleatória
    }))
  }

  const response: PerformersData = {
    creators: adjustValues(topCreators),
    donors: adjustValues(topDonors),
    period: period as string
  }

  // Simular delay de processamento
  setTimeout(() => {
    res.status(200).json(response)
  }, 400)
} 