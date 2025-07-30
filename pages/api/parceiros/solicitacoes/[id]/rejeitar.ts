import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { id } = req.query
    const { parceiroId, motivoRejeicao } = req.body

    if (!id || !parceiroId) {
      return res.status(400).json({ error: 'ID da solicitação e ID do parceiro são obrigatórios' })
    }

    // Verifica se a solicitação existe e pertence ao parceiro
    const solicitacao = await prisma.solicitacaoCompra.findFirst({
      where: {
        id: id as string,
        parceiroId: parceiroId as string,
        status: 'pendente'
      },
      include: {
        usuario: true,
        parceiro: true
      }
    })

    if (!solicitacao) {
      return res.status(404).json({ error: 'Solicitação não encontrada ou já processada' })
    }

    // Atualiza status para rejeitada
    await prisma.solicitacaoCompra.update({
      where: { id: id as string },
      data: {
        status: 'rejeitada',
        dataRejeicao: new Date(),
        motivoRejeicao: motivoRejeicao || 'Rejeitada pelo parceiro'
      }
    })

    // Cria notificação para o usuário
    await prisma.notificacao.create({
      data: {
        usuarioId: solicitacao.usuarioId,
        titulo: 'Solicitação de Compra Rejeitada',
        mensagem: `Sua solicitação de compra de R$ ${solicitacao.valorCompra.toFixed(2)} foi rejeitada pelo parceiro ${solicitacao.parceiro.nomeCidade}.${motivoRejeicao ? ` Motivo: ${motivoRejeicao}` : ''}`,
        tipo: 'solicitacao_rejeitada',
        dados: JSON.stringify({ solicitacaoId: solicitacao.id })
      }
    })

    return res.status(200).json({ 
      success: true, 
      message: 'Solicitação rejeitada com sucesso!'
    })

  } catch (error) {
    console.error('Erro ao rejeitar solicitação:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 