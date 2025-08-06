import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { usuarioId } = req.query

    console.log('Solicitações - usuarioId recebido:', usuarioId);

    if (!usuarioId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }

    // Buscar solicitações pendentes recebidas pelo usuário
    const solicitacoes = await prisma.amizade.findMany({
      where: {
        amigoId: String(usuarioId),
        status: 'pendente'
      },
      include: {
        usuario: {
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

    console.log('Solicitações encontradas:', solicitacoes);

    const solicitacoesFormatadas = solicitacoes.map(solicitacao => ({
      id: solicitacao.id,
      remetenteId: solicitacao.usuarioId,
      remetenteNome: solicitacao.usuario.nome,
      remetenteEmail: solicitacao.usuario.email,
      dataEnvio: solicitacao.dataSolicitacao,
      mensagem: undefined // Por enquanto sem mensagem personalizada
    }))

    console.log('Solicitações formatadas para retorno:', solicitacoesFormatadas);

    return res.status(200).json({ solicitacoes: solicitacoesFormatadas })
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 