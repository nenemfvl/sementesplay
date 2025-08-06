import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { categoria, periodo } = req.query

    // Calcular data de início baseada no período
    const agora = new Date()
    let dataInicio: Date

    switch (periodo) {
      case 'diario':
        dataInicio = new Date(agora.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'semanal':
        dataInicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'mensal':
        dataInicio = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        dataInicio = new Date(0) // Desde o início
    }

    let ranking: any[] = []

    if (categoria === 'doador') {
      // Ranking de doadores
      const doadores = await prisma.doacao.groupBy({
        by: ['doadorId'],
        _sum: { quantidade: true },
        _count: { id: true },
        where: {
          data: {
            gte: dataInicio
          }
        },
        orderBy: {
          _sum: { quantidade: 'desc' }
        },
        take: 20
      })

      // Buscar dados dos usuários
      const doadoresComDados = await Promise.all(
        doadores.map(async (doador, index) => {
          const usuario = await prisma.usuario.findUnique({
            where: { id: doador.doadorId }
          })

          // Contar criadores únicos apoiados
          const criadoresApoiados = await prisma.doacao.groupBy({
            by: ['criadorId'],
            where: { doadorId: doador.doadorId }
          })

          return {
            id: doador.doadorId,
            nome: usuario?.nome || 'Usuário',
            avatar: '👤',
            nivel: usuario?.nivel || 'comum',
            sementes: usuario?.sementes || 0,
            doacoes: doador._count.id,
            criadoresApoiados: criadoresApoiados.length,
            posicao: index + 1,
            categoria: 'doador' as const,
            periodo: periodo as any,
            badge: index === 0 ? 'Top Doador' : index === 1 ? 'Generoso' : index === 2 ? 'Apoiador' : 'Novato',
            icone: index === 0 ? '🏆' : index === 1 ? '💝' : index === 2 ? '🤝' : '🌱',
            cor: index === 0 ? 'text-yellow-400' : index === 1 ? 'text-blue-400' : index === 2 ? 'text-green-400' : 'text-gray-400'
          }
        })
      )

      ranking = doadoresComDados

    } else if (categoria === 'criador') {
      // Ranking de criadores
      const criadores = await prisma.doacao.groupBy({
        by: ['criadorId'],
        _sum: { quantidade: true },
        _count: { id: true },
        where: {
          data: {
            gte: dataInicio
          }
        },
        orderBy: {
          _sum: { quantidade: 'desc' }
        },
        take: 20
      })

      // Buscar dados dos criadores
      const criadoresComDados = await Promise.all(
        criadores.map(async (criador, index) => {
          const criadorData = await prisma.criador.findUnique({
            where: { id: criador.criadorId },
            include: { usuario: true }
          })

          return {
            id: criador.criadorId,
            nome: criadorData?.usuario.nome || 'Criador',
            avatar: '👨‍🎨',
            nivel: criadorData?.nivel || 'comum',
            sementes: criadorData?.sementes || 0,
            doacoes: criador._count.id,
            criadoresApoiados: 0, // Não aplicável para criadores
            posicao: index + 1,
            categoria: 'criador' as const,
            periodo: periodo as any,
            badge: index === 0 ? 'Top Criador' : index === 1 ? 'Estrela' : index === 2 ? 'Talentoso' : 'Novato',
            icone: index === 0 ? '👑' : index === 1 ? '⭐' : index === 2 ? '🎭' : '🎨',
            cor: index === 0 ? 'text-yellow-400' : index === 1 ? 'text-blue-400' : index === 2 ? 'text-green-400' : 'text-gray-400'
          }
        })
      )

      ranking = criadoresComDados

    } else if (categoria === 'missao') {
      // Ranking por missões completadas
      const missoesCompletadas = await prisma.missaoUsuario.groupBy({
        by: ['usuarioId'],
        _count: { id: true },
        where: {
          concluida: true,
          dataConclusao: {
            gte: dataInicio
          }
        },
        orderBy: {
          _count: { id: 'desc' }
        },
        take: 20
      })

      // Buscar dados dos usuários
      const usuariosComMissoes = await Promise.all(
        missoesCompletadas.map(async (missao, index) => {
          const usuario = await prisma.usuario.findUnique({
            where: { id: missao.usuarioId }
          })

          return {
            id: missao.usuarioId,
            nome: usuario?.nome || 'Usuário',
            avatar: '🎯',
            nivel: usuario?.nivel || 'comum',
            sementes: usuario?.sementes || 0,
            doacoes: 0, // Não aplicável para missões
            criadoresApoiados: 0,
            posicao: index + 1,
            categoria: 'missao' as const,
            periodo: periodo as any,
            badge: index === 0 ? 'Missão Master' : index === 1 ? 'Dedicado' : index === 2 ? 'Ativo' : 'Novato',
            icone: index === 0 ? '🎯' : index === 1 ? '⚡' : index === 2 ? '🔥' : '📋',
            cor: index === 0 ? 'text-yellow-400' : index === 1 ? 'text-blue-400' : index === 2 ? 'text-green-400' : 'text-gray-400'
          }
        })
      )

      ranking = usuariosComMissoes

    } else if (categoria === 'social') {
      // Ranking por atividade social (amizades, mensagens, etc.)
      const usuariosAtivos = await prisma.usuario.findMany({
        orderBy: { pontuacao: 'desc' },
        take: 20
      })

      const rankingSocial = usuariosAtivos.map((usuario, index) => ({
        id: usuario.id,
        nome: usuario.nome,
        avatar: '👥',
        nivel: usuario.nivel,
        sementes: usuario.sementes,
        doacoes: 0,
        criadoresApoiados: 0,
        posicao: index + 1,
        categoria: 'social' as const,
        periodo: periodo as any,
        badge: index === 0 ? 'Social Butterfly' : index === 1 ? 'Comunicador' : index === 2 ? 'Ativo' : 'Novato',
        icone: index === 0 ? '🦋' : index === 1 ? '💬' : index === 2 ? '👋' : '🌱',
        cor: index === 0 ? 'text-yellow-400' : index === 1 ? 'text-blue-400' : index === 2 ? 'text-green-400' : 'text-gray-400'
      }))

      ranking = rankingSocial
    }

    return res.status(200).json({ ranking })
  } catch (error) {
    console.error('Erro ao buscar ranking:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 