import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { paymentId } = req.query

    if (!paymentId) {
      return res.status(400).json({ error: 'ID do pagamento obrigatório' })
    }

    // Buscar repasse pelo paymentId
    const repasse = await prisma.repasseParceiro.findFirst({
      where: {
        paymentId: String(paymentId),
        status: 'aguardando_pagamento'
      },
      include: {
        compra: true
      }
    })

    if (!repasse) {
      return res.status(404).json({ error: 'Pagamento não encontrado' })
    }

    // Simular verificação de pagamento (em produção, integrar com API bancária)
    // Por enquanto, vamos simular que o pagamento foi confirmado após 30 segundos
    const tempoAguardando = Date.now() - new Date(repasse.dataRepasse).getTime()
    const pagamentoConfirmado = tempoAguardando > 30000 // 30 segundos

    if (pagamentoConfirmado) {
      // Atualizar status do repasse
      await prisma.repasseParceiro.update({
        where: { id: repasse.id },
        data: {
          status: 'confirmado',
          dataRepasse: new Date()
        }
      })

      // Atualizar status da compra
      await prisma.compraParceiro.update({
        where: { id: repasse.compraId },
        data: { status: 'cashback_liberado' }
      })

      // Criar notificação
      try {
        await prisma.notificacao.create({
          data: {
            usuarioId: 'admin',
            tipo: 'repasse_confirmado',
            titulo: 'Pagamento PIX Confirmado',
            mensagem: `Pagamento PIX confirmado para repasse de R$ ${repasse.valor.toFixed(2)}`,
            data: new Date()
          }
        })
      } catch (notifError) {
        console.log('Erro ao criar notificação:', notifError)
      }

      return res.status(200).json({
        success: true,
        status: 'confirmado',
        message: 'Pagamento confirmado com sucesso!'
      })
    }

    // Pagamento ainda pendente
    return res.status(200).json({
      success: true,
      status: 'pendente',
      message: 'Aguardando confirmação do pagamento...',
      tempoAguardando: Math.floor(tempoAguardando / 1000)
    })

  } catch (error) {
    console.error('Erro ao verificar pagamento:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 