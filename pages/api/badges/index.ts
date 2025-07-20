import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Por enquanto, retornar dados mockados
    const badges = [
      {
        id: '1',
        nome: 'Doador Iniciante',
        descricao: 'Primeira doação realizada',
        icone: '🌱',
        cor: 'green',
        desbloqueada: true,
        nivel: 1,
        maxNivel: 1
      },
      {
        id: '2',
        nome: 'Doador Generoso',
        descricao: 'Doa regularmente',
        icone: '🎁',
        cor: 'blue',
        desbloqueada: true,
        nivel: 2,
        maxNivel: 5
      },
      {
        id: '3',
        nome: 'Social Butterfly',
        descricao: 'Muito ativo socialmente',
        icone: '🦋',
        cor: 'purple',
        desbloqueada: true,
        nivel: 3,
        maxNivel: 10
      },
      {
        id: '4',
        nome: 'Comunicador',
        descricao: 'Ativo no chat',
        icone: '💬',
        cor: 'cyan',
        desbloqueada: false,
        nivel: 0,
        maxNivel: 5
      },
      {
        id: '5',
        nome: 'Top Doador',
        descricao: 'Entre os melhores doadores',
        icone: '🏆',
        cor: 'yellow',
        desbloqueada: false,
        nivel: 0,
        maxNivel: 1
      },
      {
        id: '6',
        nome: 'Missão Master',
        descricao: 'Completa muitas missões',
        icone: '⭐',
        cor: 'orange',
        desbloqueada: false,
        nivel: 0,
        maxNivel: 3
      },
      {
        id: '7',
        nome: 'Apoiador',
        descricao: 'Apoia muitos criadores',
        icone: '👨‍🎨',
        cor: 'pink',
        desbloqueada: false,
        nivel: 0,
        maxNivel: 5
      },
      {
        id: '8',
        nome: 'Fiel',
        descricao: 'Login diário consistente',
        icone: '📅',
        cor: 'indigo',
        desbloqueada: false,
        nivel: 0,
        maxNivel: 7
      },
      {
        id: '9',
        nome: 'Benfeitor',
        descricao: 'Grande doador',
        icone: '💰',
        cor: 'gold',
        desbloqueada: false,
        nivel: 0,
        maxNivel: 1
      },
      {
        id: '10',
        nome: 'Lenda',
        descricao: 'Nível máximo alcançado',
        icone: '👑',
        cor: 'red',
        desbloqueada: false,
        nivel: 0,
        maxNivel: 1
      }
    ]

    return res.status(200).json({ badges })
  } catch (error) {
    console.error('Erro ao buscar badges:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 