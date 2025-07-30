import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { parceiroId } = req.query

    if (!parceiroId) {
      return res.status(400).json({ error: 'ID do parceiro é obrigatório' })
    }

    // Busca solicitações pendentes do parceiro
    const solicitacoes = await prisma.solicitacaoCompra.findMany({
      where: {
        parceiroId: parceiroId as string,
        status: 'pendente'
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatarUrl: true
          }
        },
        parceiro: {
          select: {
            id: true,
            nomeCidade: true
          }
        }
      },
      orderBy: {
        dataCompra: 'desc'
      }
    })

    return res.status(200).json({ 
      success: true, 
      solicitacoes 
    })

  } catch (error) {
    console.error('Erro ao buscar solicitações:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 