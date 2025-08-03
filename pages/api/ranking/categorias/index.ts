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
        nome: 'Geral',
        descricao: 'Ranking geral por doações e atividade',
        icone: '🏆',
        cor: 'text-yellow-400',
        totalParticipantes: totalDoadores
      },
      {
        id: 'criador',
        nome: 'Doações',
        descricao: 'Usuários que mais doaram Sementes',
        icone: '💝',
        cor: 'text-pink-400',
        totalParticipantes: totalDoadores
      },
      {
        id: 'social',
        nome: 'Pontos',
        descricao: 'Ranking por pontuação total (sementes doadas)',
        icone: '⭐',
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