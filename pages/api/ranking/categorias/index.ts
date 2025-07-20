import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const categorias = [
      {
        id: 'doador',
        nome: 'Doadores',
        descricao: 'Ranking dos maiores doadores',
        icone: '💝',
        cor: 'red',
        totalParticipantes: 1250
      },
      {
        id: 'criador',
        nome: 'Criadores',
        descricao: 'Ranking dos criadores mais apoiados',
        icone: '👨‍🎨',
        cor: 'purple',
        totalParticipantes: 450
      },
      {
        id: 'missao',
        nome: 'Missões',
        descricao: 'Ranking por missões completadas',
        icone: '⭐',
        cor: 'yellow',
        totalParticipantes: 890
      },
      {
        id: 'social',
        nome: 'Social',
        descricao: 'Ranking por atividade social',
        icone: '🦋',
        cor: 'blue',
        totalParticipantes: 670
      }
    ]

    return res.status(200).json({ categorias })
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 