import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Por enquanto, retornar dados mockados
    const conquistas = [
      {
        id: '1',
        titulo: 'Primeiro Passo',
        descricao: 'Complete sua primeira missão',
        icone: '🎯',
        cor: 'green',
        desbloqueada: true,
        dataDesbloqueio: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
        raridade: 'comum' as const
      },
      {
        id: '2',
        titulo: 'Doador Iniciante',
        descricao: 'Faça sua primeira doação',
        icone: '💝',
        cor: 'red',
        desbloqueada: false,
        raridade: 'comum' as const
      },
      {
        id: '3',
        titulo: 'Social Butterfly',
        descricao: 'Adicione 10 amigos',
        icone: '🦋',
        cor: 'blue',
        desbloqueada: true,
        dataDesbloqueio: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 dias atrás
        raridade: 'rara' as const
      },
      {
        id: '4',
        titulo: 'Chat Master',
        descricao: 'Envie 100 mensagens no chat',
        icone: '💬',
        cor: 'purple',
        desbloqueada: false,
        raridade: 'rara' as const
      },
      {
        id: '5',
        titulo: 'Top Doador',
        descricao: 'Fique no top 5 do ranking por 1 mês',
        icone: '🏆',
        cor: 'yellow',
        desbloqueada: false,
        raridade: 'epica' as const
      },
      {
        id: '6',
        titulo: 'Missão Master',
        descricao: 'Complete 50 missões',
        icone: '⭐',
        cor: 'orange',
        desbloqueada: false,
        raridade: 'epica' as const
      },
      {
        id: '7',
        titulo: 'Lenda do Sistema',
        descricao: 'Alcance o nível máximo',
        icone: '👑',
        cor: 'gold',
        desbloqueada: false,
        raridade: 'lendaria' as const
      },
      {
        id: '8',
        titulo: 'Benfeitor',
        descricao: 'Doe 10.000 Sementes no total',
        icone: '💰',
        cor: 'green',
        desbloqueada: false,
        raridade: 'lendaria' as const
      },
      {
        id: '9',
        titulo: 'Fiel',
        descricao: 'Faça login por 30 dias consecutivos',
        icone: '📅',
        cor: 'cyan',
        desbloqueada: false,
        raridade: 'rara' as const
      },
      {
        id: '10',
        titulo: 'Apoiador',
        descricao: 'Doa para 10 criadores diferentes',
        icone: '👨‍🎨',
        cor: 'pink',
        desbloqueada: false,
        raridade: 'epica' as const
      }
    ]

    return res.status(200).json({ conquistas })
  } catch (error) {
    console.error('Erro ao buscar conquistas:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 