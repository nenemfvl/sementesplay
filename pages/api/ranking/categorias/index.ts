import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Buscar estatísticas reais para cada categoria
    const [totalDoadores, totalCriadores, totalMissoes, totalSocial] = await Promise.all([
      // Total de doadores únicos
      prisma.doacao.groupBy({
        by: ['doadorId'],
        _count: { doadorId: true }
      }).then(result => result.length),

      // Total de criadores únicos
      prisma.doacao.groupBy({
        by: ['criadorId'],
        _count: { criadorId: true }
      }).then(result => result.length),

      // Total de missões completadas
      prisma.missaoUsuario.count({
        where: { concluida: true }
      }),

      // Total de usuários ativos (com pontuação > 0)
      prisma.usuario.count({
        where: { pontuacao: { gt: 0 } }
      })
    ])

    const categorias = [
      {
        id: 'doador',
        nome: 'Doadores',
        descricao: 'Usuários que mais doaram Sementes',
        icone: '💝',
        cor: 'text-pink-400',
        totalParticipantes: totalDoadores
      },
      {
        id: 'criador',
        nome: 'Criadores',
        descricao: 'Criadores que mais receberam doações',
        icone: '👨‍🎨',
        cor: 'text-purple-400',
        totalParticipantes: totalCriadores
      },
      {
        id: 'missao',
        nome: 'Missões',
        descricao: 'Usuários que mais completaram missões',
        icone: '🎯',
        cor: 'text-blue-400',
        totalParticipantes: totalMissoes
      },
      {
        id: 'social',
        nome: 'Social',
        descricao: 'Usuários mais ativos socialmente',
        icone: '👥',
        cor: 'text-green-400',
        totalParticipantes: totalSocial
      }
    ]

    return res.status(200).json({ categorias })
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 