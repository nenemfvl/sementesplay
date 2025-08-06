import { prisma } from '../../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { usuarioId } = req.query

    if (!usuarioId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }

    // Buscar dados reais do usuário
    const [comprasPendentes, comprasAprovadas, codigosUsados] = await Promise.all([
      // Compras pendentes (todas exceto cashback_liberado)
      prisma.compraParceiro.findMany({
        where: {
          usuarioId: String(usuarioId),
          status: {
            not: 'cashback_liberado'
          }
        }
      }),
      // Compras aprovadas (cashback liberado)
      prisma.compraParceiro.findMany({
        where: {
          usuarioId: String(usuarioId),
          status: 'cashback_liberado'
        }
      }),
      // Códigos de cashback usados pelo usuário específico
      prisma.codigoCashback.findMany({
        where: {
          usado: true,
          usuarioId: String(usuarioId)
        }
      })
    ])

    // Calcular estatísticas
    const totalPendente = comprasPendentes.reduce((total, compra) => {
      return total + (compra.valorCompra * 0.05) // 5% para o usuário
    }, 0)

    const totalResgatado = comprasAprovadas.reduce((total, compra) => {
      return total + (compra.valorCompra * 0.05) // 5% para o usuário
    }, 0)

    // Adicionar valor dos códigos usados ao total resgatado
    const totalCodigosUsados = codigosUsados.reduce((total, codigo) => {
      return total + codigo.valor
    }, 0)

    const economiaTotal = comprasAprovadas.reduce((total, compra) => {
      return total + compra.valorCompra
    }, 0)

    // Resgates do mês atual
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)

    const resgatesMes = comprasAprovadas.filter(compra => 
      compra.dataCompra >= inicioMes
    ).length

    const mediaPorResgate = comprasAprovadas.length > 0 
      ? totalResgatado / comprasAprovadas.length 
      : 0

    const estatisticas = {
      totalResgatado: Math.round(totalResgatado + totalCodigosUsados),
      totalPendente: Math.round(totalPendente),
      codigosUsados: codigosUsados.length,
      economiaTotal: Math.round(economiaTotal),
      resgatesMes,
      mediaPorResgate: Math.round(mediaPorResgate)
    }

    return res.status(200).json({ estatisticas })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 