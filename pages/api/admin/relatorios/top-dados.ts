import { prisma } from '../../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { periodo } = req.query
    const periodoStr = String(periodo || '7d')

    // Calcular data de início baseada no período
    const agora = new Date()
    let dataInicio: Date

    switch (periodoStr) {
      case '7d':
        dataInicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        dataInicio = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        dataInicio = new Date(agora.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        dataInicio = new Date(agora.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        dataInicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Buscar top doadores usando Prisma ORM
    const topDoadores = await prisma.doacao.groupBy({
      by: ['doadorId'],
      where: {
        data: {
          gte: dataInicio
        }
      },
      _sum: {
        quantidade: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          quantidade: 'desc'
        }
      },
      take: 5
    })

    // Buscar dados dos doadores
    const doadoresComNomes = await Promise.all(
      topDoadores.map(async (doador) => {
        const usuario = await prisma.usuario.findUnique({
          where: { id: doador.doadorId },
          select: { nome: true }
        })
        return {
          nome: usuario?.nome || 'Usuário Desconhecido',
          valor: doador._sum.quantidade || 0,
          quantidade: doador._count.id
        }
      })
    )

    // Buscar top criadores usando Prisma ORM
    const topCriadores = await prisma.doacao.groupBy({
      by: ['criadorId'],
      where: {
        data: {
          gte: dataInicio
        }
      },
      _sum: {
        quantidade: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          quantidade: 'desc'
        }
      },
      take: 5
    })

    // Buscar dados dos criadores
    const criadoresComNomes = await Promise.all(
      topCriadores.map(async (criador) => {
        const criadorData = await prisma.criador.findUnique({
          where: { id: criador.criadorId },
          include: {
            usuario: {
              select: { nome: true }
            }
          }
        })
        return {
          nome: criadorData?.usuario?.nome || 'Criador Desconhecido',
          recebido: criador._sum.quantidade || 0,
          doacoes: criador._count.id
        }
      })
    )

    // COMENTADO: Dados mockados - substituir por consulta real ao banco quando implementar sistema de relatórios
    /*
    const topCashbacks = [
      { codigo: 'BONUS100', usos: 45, valor: 4500 },
      { codigo: 'WELCOME50', usos: 32, valor: 1600 },
      { codigo: 'SUMMER25', usos: 28, valor: 700 },
      { codigo: 'FESTIVAL75', usos: 15, valor: 1125 },
      { codigo: 'SPECIAL30', usos: 12, valor: 360 }
    ]
    */
    const topCashbacks: any[] = [] // COMENTADO: Array vazio até implementar sistema real

    const topDados = {
      topDoadores: doadoresComNomes,
      topCriadores: criadoresComNomes,
      topCashbacks
    }

    return res.status(200).json(topDados)
  } catch (error) {
    // COMENTADO: Log de debug - não afeta funcionalidade
    // console.error('Erro ao buscar top dados:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 