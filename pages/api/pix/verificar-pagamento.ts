import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Não autorizado' })
    }

    const { paymentId } = req.query

    if (!paymentId || typeof paymentId !== 'string') {
      return res.status(400).json({ error: 'PaymentId obrigatório' })
    }

    // Buscar o repasse pelo paymentId
    const repasse = await prisma.repasseParceiro.findFirst({
      where: {
        paymentId: paymentId,
        parceiro: {
          usuarioId: session.user.id
        }
      },
      include: {
        parceiro: true,
        compraParceiro: true
      }
    })

    if (!repasse) {
      return res.status(404).json({ error: 'Pagamento não encontrado' })
    }

    // Simular verificação de pagamento (você pode integrar com um provedor real)
    // Por enquanto, vamos simular que o pagamento foi confirmado após alguns segundos
    const tempoDecorrido = Date.now() - parseInt(paymentId.split('_')[1])
    const confirmado = tempoDecorrido > 5000 // 5 segundos para simular confirmação

    if (confirmado && repasse.status === 'aguardando_pagamento') {
      // Atualizar status do repasse
      await prisma.repasseParceiro.update({
        where: { id: repasse.id },
        data: {
          status: 'pago',
          dataPagamento: new Date()
        }
      })

      // Atualizar status da compra
      await prisma.compraParceiro.update({
        where: { id: repasse.compraParceiro.id },
        data: {
          status: 'cashback_liberado'
        }
      })

      // Adicionar sementes ao usuário
      const valorSementes = repasse.compraParceiro.valorCompra * 0.05 // 5% para o usuário
      await prisma.usuario.update({
        where: { id: repasse.compraParceiro.usuarioId },
        data: {
          sementes: {
            increment: valorSementes
          }
        }
      })

      // Criar notificação para o usuário
      await prisma.notificacao.create({
        data: {
          usuarioId: repasse.compraParceiro.usuarioId,
          titulo: 'Cashback Liberado!',
          mensagem: `Seu cashback de ${valorSementes} Sementes foi liberado pela compra de R$ ${repasse.compraParceiro.valorCompra.toFixed(2)}.`,
          tipo: 'cashback_liberado'
        }
      })

      return res.status(200).json({
        status: 'confirmado',
        message: 'Pagamento confirmado com sucesso!'
      })
    }

    return res.status(200).json({
      status: repasse.status === 'pago' ? 'confirmado' : 'pendente',
      message: repasse.status === 'pago' ? 'Pagamento já foi confirmado' : 'Aguardando confirmação do pagamento'
    })

  } catch (error) {
    console.error('Erro ao verificar pagamento:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 