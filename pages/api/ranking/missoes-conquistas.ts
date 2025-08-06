import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { tipo } = req.query // 'doacoes', 'pontos' ou 'geral'

    if (tipo === 'doacoes') {
      // Ranking por doações realizadas
      const rankingDoacoes = await prisma.doacao.groupBy({
        by: ['doadorId'],
        _count: { id: true },
        _sum: { quantidade: true },
        orderBy: {
          _sum: { quantidade: 'desc' }
        },
        take: 20
      })

      // Buscar dados dos usuários
      const rankingComDados = await Promise.all(
        rankingDoacoes.map(async (doacao, index) => {
          const usuario = await prisma.usuario.findUnique({
            where: { id: doacao.doadorId }
          })

          return {
            id: doacao.doadorId,
            nome: usuario?.nome || 'Usuário',
            avatar: usuario?.avatarUrl || '👤',
            nivel: usuario?.nivel || 'comum',
            sementes: usuario?.sementes || 0,
            pontuacao: usuario?.pontuacao || 0,
            posicao: index + 1,
            totalDoacoes: doacao._sum.quantidade || 0,
            doacoes: doacao._count.id,
            badge: index === 0 ? 'Doador Master' : index === 1 ? 'Generoso' : index === 2 ? 'Solidário' : 'Novato',
            icone: index === 0 ? '💝' : index === 1 ? '❤️' : index === 2 ? '🤝' : '🌱',
            cor: index === 0 ? 'text-yellow-400' : index === 1 ? 'text-blue-400' : index === 2 ? 'text-green-400' : 'text-gray-400'
          }
        })
      )

      return res.status(200).json({ ranking: rankingComDados })
    }

    if (tipo === 'pontos') {
      // Ranking por pontuação total
      const rankingPontos = await prisma.usuario.findMany({
        where: {
          pontuacao: { gt: 0 }
        },
        orderBy: {
          pontuacao: 'desc'
        },
        take: 20,
        select: {
          id: true,
          nome: true,
          avatarUrl: true,
          nivel: true,
          sementes: true,
          pontuacao: true
        }
      })

      const rankingComDados = rankingPontos.map((usuario, index) => ({
        id: usuario.id,
        nome: usuario.nome || 'Usuário',
        avatar: usuario.avatarUrl || '👤',
        nivel: usuario.nivel || 'comum',
        sementes: usuario.sementes || 0,
        pontuacao: usuario.pontuacao || 0,
        posicao: index + 1,
        totalPontos: usuario.pontuacao || 0,
        badge: index === 0 ? 'Pontuador' : index === 1 ? 'Destacado' : index === 2 ? 'Ativo' : 'Novato',
        icone: index === 0 ? '⭐' : index === 1 ? '🌟' : index === 2 ? '✨' : '🌱',
        cor: index === 0 ? 'text-yellow-400' : index === 1 ? 'text-blue-400' : index === 2 ? 'text-green-400' : 'text-gray-400'
      }))

      return res.status(200).json({ ranking: rankingComDados })
    }

    // Ranking geral (doações + pontos)
    const [rankingDoacoes, rankingPontos] = await Promise.all([
      prisma.doacao.groupBy({
        by: ['doadorId'],
        _count: { id: true },
        _sum: { quantidade: true }
      }),
      prisma.usuario.findMany({
        where: {
          pontuacao: { gt: 0 }
        },
        select: {
          id: true,
          pontuacao: true
        }
      })
    ])

    // Combinar pontuações
    const pontuacoes = new Map<string, { doacoes: number, pontos: number, total: number }>()

    rankingDoacoes.forEach(d => {
      pontuacoes.set(d.doadorId, { 
        doacoes: d._sum.quantidade || 0, 
        pontos: 0, 
        total: (d._sum.quantidade || 0) + 0
      })
    })

    rankingPontos.forEach(u => {
      const atual = pontuacoes.get(u.id)
      if (atual) {
        atual.pontos = u.pontuacao || 0
        atual.total += u.pontuacao || 0
      } else {
        pontuacoes.set(u.id, { 
          doacoes: 0, 
          pontos: u.pontuacao || 0, 
          total: u.pontuacao || 0
        })
      }
    })

    // Ordenar por pontuação total
    const rankingGeral = Array.from(pontuacoes.entries())
      .map(([usuarioId, pontuacao]) => ({ usuarioId, ...pontuacao }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20)

    // Buscar dados dos usuários
    const rankingComDados = await Promise.all(
      rankingGeral.map(async (item, index) => {
        const usuario = await prisma.usuario.findUnique({
          where: { id: item.usuarioId }
        })

        return {
          id: item.usuarioId,
          nome: usuario?.nome || 'Usuário',
          avatar: usuario?.avatarUrl || '👤',
          nivel: usuario?.nivel || 'comum',
          sementes: usuario?.sementes || 0,
          pontuacao: usuario?.pontuacao || 0,
          posicao: index + 1,
          doacoes: item.doacoes,
          pontos: item.pontos,
          total: item.total,
          badge: index === 0 ? 'Lenda' : index === 1 ? 'Mestre' : index === 2 ? 'Veterano' : 'Novato',
          icone: index === 0 ? '👑' : index === 1 ? '🏆' : index === 2 ? '⭐' : '🌱',
          cor: index === 0 ? 'text-yellow-400' : index === 1 ? 'text-blue-400' : index === 2 ? 'text-green-400' : 'text-gray-400'
        }
      })
    )

    return res.status(200).json({ ranking: rankingComDados })
  } catch (error) {
    console.error('Erro ao buscar ranking de doações/pontos:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
} 