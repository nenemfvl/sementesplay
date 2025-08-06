import { prisma } from '../../../lib/prisma'


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

    // Buscar solicitações pendentes enviadas pelo usuário
    const solicitacoes = await prisma.amizade.findMany({
      where: {
        usuarioId: String(usuarioId),
        status: 'pendente'
      },
      include: {
        amigo: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      orderBy: {
        dataSolicitacao: 'desc'
      }
    })

    const solicitacoesFormatadas = solicitacoes.map(solicitacao => ({
      id: solicitacao.id,
      destinatarioId: solicitacao.amigoId,
      destinatarioNome: solicitacao.amigo.nome,
      destinatarioEmail: solicitacao.amigo.email,
      dataEnvio: solicitacao.dataSolicitacao
    }))

    return res.status(200).json({ solicitacoes: solicitacoesFormatadas })
  } catch (error) {
    console.error('Erro ao buscar solicitações enviadas:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 