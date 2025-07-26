import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { tipo } = req.query // 'missoes' ou 'conquistas'

    if (tipo === 'missoes') {
      // Ranking por missões completadas
      const rankingMissoes = await prisma.missaoUsuario.groupBy({
        by: ['usuarioId'],
        _count: { id: true },
        where: {
          concluida: true
        },
        orderBy: {
          _count: { id: 'desc' }
        },
        take: 20
      })

      // Buscar dados dos usuários
      const rankingComDados = await Promise.all(
        rankingMissoes.map(async (missao, index) => {
          const usuario = await prisma.usuario.findUnique({
            where: { id: missao.usuarioId }
          })

          // Buscar missões específicas completadas
          const missoesCompletadas = await prisma.missaoUsuario.findMany({
            where: {
              usuarioId: missao.usuarioId,
              concluida: true
            },
            include: {
              missao: true
            },
            orderBy: {
              dataConclusao: 'desc'
            },
            take: 5
          })

          return {
            id: missao.usuarioId,
            nome: usuario?.nome || 'Usuário',
            avatar: usuario?.avatarUrl || '👤',
            nivel: usuario?.nivel || 'comum',
            sementes: usuario?.sementes || 0,
            pontuacao: usuario?.pontuacao || 0,
            posicao: index + 1,
            totalMissoes: missao._count.id,
            missoesRecentes: missoesCompletadas.map(m => ({
              titulo: m.missao.titulo,
              tipo: m.missao.tipo,
              dataCompletada: m.dataConclusao
            })),
            badge: index === 0 ? 'Missão Master' : index === 1 ? 'Dedicado' : index === 2 ? 'Ativo' : 'Novato',
            icone: index === 0 ? '🎯' : index === 1 ? '⚡' : index === 2 ? '🔥' : '📋',
            cor: index === 0 ? 'text-yellow-400' : index === 1 ? 'text-blue-400' : index === 2 ? 'text-green-400' : 'text-gray-400'
          }
        })
      )

      return res.status(200).json({ ranking: rankingComDados })
    }

    if (tipo === 'conquistas') {
      // Ranking por conquistas desbloqueadas
      const rankingConquistas = await prisma.conquistaUsuario.groupBy({
        by: ['usuarioId'],
        _count: { id: true },
        orderBy: {
          _count: { id: 'desc' }
        },
        take: 20
      })

      // Buscar dados dos usuários
      const rankingComDados = await Promise.all(
        rankingConquistas.map(async (conquista, index) => {
          const usuario = await prisma.usuario.findUnique({
            where: { id: conquista.usuarioId }
          })

          // Buscar conquistas específicas desbloqueadas
          const conquistasDesbloqueadas = await prisma.conquistaUsuario.findMany({
            where: {
              usuarioId: conquista.usuarioId
            },
            include: {
              conquista: true
            },
            orderBy: {
              dataConquista: 'desc'
            },
            take: 5
          })

          return {
            id: conquista.usuarioId,
            nome: usuario?.nome || 'Usuário',
            avatar: usuario?.avatarUrl || '👤',
            nivel: usuario?.nivel || 'comum',
            sementes: usuario?.sementes || 0,
            pontuacao: usuario?.pontuacao || 0,
            posicao: index + 1,
            totalConquistas: conquista._count.id,
            conquistasRecentes: conquistasDesbloqueadas.map(c => ({
              titulo: c.conquista.titulo,
              icone: c.conquista.icone,
              dataConquista: c.dataConquista
            })),
            badge: index === 0 ? 'Conquistador' : index === 1 ? 'Destemido' : index === 2 ? 'Valente' : 'Novato',
            icone: index === 0 ? '🏆' : index === 1 ? '⭐' : index === 2 ? '🌟' : '📜',
            cor: index === 0 ? 'text-yellow-400' : index === 1 ? 'text-blue-400' : index === 2 ? 'text-green-400' : 'text-gray-400'
          }
        })
      )

      return res.status(200).json({ ranking: rankingComDados })
    }

    // Ranking geral (missões + conquistas)
    const [rankingMissoes, rankingConquistas] = await Promise.all([
      prisma.missaoUsuario.groupBy({
        by: ['usuarioId'],
        _count: { id: true },
        where: { concluida: true }
      }),
      prisma.conquistaUsuario.groupBy({
        by: ['usuarioId'],
        _count: { id: true }
      })
    ])

    // Combinar pontuações
    const pontuacoes = new Map<string, { missoes: number, conquistas: number, total: number }>()

    rankingMissoes.forEach(m => {
      pontuacoes.set(m.usuarioId, { 
        missoes: m._count.id, 
        conquistas: 0, 
        total: m._count.id 
      })
    })

    rankingConquistas.forEach(c => {
      const atual = pontuacoes.get(c.usuarioId)
      if (atual) {
        atual.conquistas = c._count.id
        atual.total += c._count.id
      } else {
        pontuacoes.set(c.usuarioId, { 
          missoes: 0, 
          conquistas: c._count.id, 
          total: c._count.id 
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
          missoes: item.missoes,
          conquistas: item.conquistas,
          total: item.total,
          badge: index === 0 ? 'Lenda' : index === 1 ? 'Mestre' : index === 2 ? 'Veterano' : 'Novato',
          icone: index === 0 ? '👑' : index === 1 ? '🏆' : index === 2 ? '⭐' : '🌱',
          cor: index === 0 ? 'text-yellow-400' : index === 1 ? 'text-blue-400' : index === 2 ? 'text-green-400' : 'text-gray-400'
        }
      })
    )

    return res.status(200).json({ ranking: rankingComDados })
  } catch (error) {
    console.error('Erro ao buscar ranking de missões/conquistas:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 