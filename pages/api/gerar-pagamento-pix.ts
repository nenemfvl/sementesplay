import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { repasseId, parceiroId, usuarioId } = req.body

    if (!repasseId || !parceiroId || !usuarioId) {
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' })
    }

    // Verificar se o parceiro existe
    const parceiro = await prisma.parceiro.findFirst({
      where: {
        id: parceiroId,
        usuarioId: usuarioId
      }
    })

    if (!parceiro) {
      return res.status(404).json({ error: 'Parceiro não encontrado' })
    }

    // Verificar se o repasse existe
    const repasse = await prisma.repasseParceiro.findFirst({
      where: {
        id: repasseId,
        parceiroId: parceiro.id,
        status: 'pendente'
      },
      include: {
        compra: true
      }
    })

    if (!repasse) {
      return res.status(404).json({ error: 'Repasse não encontrado ou já processado' })
    }

    // Gerar paymentId
    const paymentId = `pix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Gerar dados do PIX
    const pixData = {
      chavePix: '82988181358',
      beneficiario: {
        nome: 'SementesPLAY',
        cpf: '12345678901'
      },
      valor: repasse.valor,
      descricao: `Repasse Parceiro - R$ ${repasse.valor.toFixed(2)}`,
      expiracao: 3600
    }

    // Atualizar repasse
    await prisma.repasseParceiro.update({
      where: { id: repasseId },
      data: {
        paymentId: paymentId,
        status: 'aguardando_pagamento'
      }
    })

    return res.status(200).json({
      paymentId: paymentId,
      pixData: pixData,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(pixData))}`,
      instrucoes: [
        '1. Abra seu app bancário',
        '2. Escaneie o QR Code ou use a chave PIX: 82988181358',
        '3. Confirme o valor do repasse (10% da compra)',
        '4. Faça o pagamento do valor do repasse',
        '5. Aguarde a confirmação automática'
      ],
      status: 'pendente'
    })

  } catch (error) {
    console.error('Erro ao gerar pagamento PIX:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 