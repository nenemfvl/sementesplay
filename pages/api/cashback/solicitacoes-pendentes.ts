import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { usuarioId } = req.query

    if (!usuarioId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }

    // Buscar solicitações de compra pendentes do usuário
    const solicitacoesPendentes = await prisma.solicitacaoCompra.findMany({
      where: {
        usuarioId: String(usuarioId),
        status: 'pendente'
      },
      include: {
        parceiro: {
          select: {
            nomeCidade: true
          }
        }
      },
      orderBy: {
        dataCompra: 'desc'
      }
    })

    // Buscar compras aprovadas que ainda não foram liberadas
    const comprasAprovadas = await prisma.compraParceiro.findMany({
      where: {
        usuarioId: String(usuarioId),
        status: {
          not: 'cashback_liberado'
        }
      },
      include: {
        parceiro: {
          select: {
            nomeCidade: true
          }
        },
        repasse: {
          select: {
            id: true,
            status: true,
            dataRepasse: true,
            comprovanteUrl: true
          }
        }
      },
      orderBy: {
        dataCompra: 'desc'
      }
    })

    // Formatar solicitações pendentes
    const solicitacoesFormatadas = solicitacoesPendentes.map(solicitacao => ({
      id: solicitacao.id,
      parceiroNome: solicitacao.parceiro.nomeCidade,
      valorCompra: solicitacao.valorCompra,
      valorCashback: solicitacao.valorCompra * 0.05, // 5% para o usuário
      dataCompra: solicitacao.dataCompra,
      status: 'solicitacao_pendente',
      comprovanteUrl: solicitacao.comprovanteUrl,
      repasse: null
    }))

    // Formatar compras aprovadas
    const comprasFormatadas = comprasAprovadas.map(compra => ({
      id: compra.id,
      parceiroNome: compra.parceiro.nomeCidade,
      valorCompra: compra.valorCompra,
      valorCashback: compra.valorCompra * 0.05, // 5% para o usuário
      dataCompra: compra.dataCompra,
      status: compra.status,
      comprovanteUrl: compra.comprovanteUrl,
      repasse: compra.repasse ? {
        id: compra.repasse.id,
        status: compra.repasse.status,
        dataRepasse: compra.repasse.dataRepasse,
        comprovanteUrl: compra.repasse.comprovanteUrl
      } : null
    }))

    // Combinar e ordenar por data
    const solicitacoes = [...solicitacoesFormatadas, ...comprasFormatadas].sort((a, b) => 
      new Date(b.dataCompra).getTime() - new Date(a.dataCompra).getTime()
    )

    return res.status(200).json({ 
      solicitacoes,
      total: solicitacoes.length
    })

  } catch (error) {
    console.error('Erro ao buscar solicitações pendentes:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 