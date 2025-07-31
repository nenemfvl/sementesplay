import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { repasseId, parceiroId, comprovanteUrl } = req.body

    if (!repasseId || !parceiroId) {
      return res.status(400).json({ error: 'Dados obrigatórios ausentes' })
    }

    // Verificar se o repasse existe e pertence ao parceiro
    const repasse = await prisma.repasseParceiro.findFirst({
      where: {
        id: String(repasseId),
        parceiroId: String(parceiroId),
        status: 'pendente'
      }
    })

    if (!repasse) {
      return res.status(404).json({ error: 'Repasse não encontrado ou já processado' })
    }

    // Atualizar o repasse com o comprovante
    await prisma.repasseParceiro.update({
      where: { id: String(repasseId) },
      data: {
        comprovanteUrl: comprovanteUrl || null,
        status: 'confirmado',
        dataRepasse: new Date()
      }
    })

    // Atualizar status da compra relacionada
    await prisma.compraParceiro.update({
      where: { id: repasse.compraParceiroId },
      data: { status: 'cashback_liberado' }
    })

    // Criar notificação para o admin (se existir)
    try {
      await prisma.notificacao.create({
        data: {
          usuarioId: 'admin',
          tipo: 'repasse_confirmado',
          titulo: 'Novo Comprovante PIX Recebido',
          mensagem: `Parceiro enviou comprovante PIX para repasse de R$ ${repasse.valor.toFixed(2)}`,
          data: new Date()
        }
      })
    } catch (notifError) {
      console.log('Erro ao criar notificação (pode ser ignorado):', notifError)
    }

    res.status(200).json({ 
      success: true, 
      message: 'Comprovante enviado com sucesso',
      comprovanteUrl 
    })

  } catch (error) {
    console.error('Erro ao processar comprovante:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 