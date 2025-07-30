import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { repasseId, parceiroId } = req.body

    if (!repasseId || !parceiroId) {
      return res.status(400).json({ error: 'Dados obrigatórios ausentes' })
    }

    // Verificar se o repasse existe e pertence ao parceiro
    const repasse = await prisma.repasseParceiro.findFirst({
      where: {
        id: String(repasseId),
        parceiroId: String(parceiroId),
        status: 'pendente'
      },
      include: {
        compra: {
          include: {
            usuario: true
          }
        }
      }
    })

    if (!repasse) {
      return res.status(404).json({ error: 'Repasse não encontrado ou já processado' })
    }

    // Gerar ID único para o pagamento
    const paymentId = `pix_${Date.now()}_${repasse.id}`
    
    // Dados do pagamento PIX
    const pixData = {
      paymentId,
      valor: repasse.valor,
      chavePix: process.env.PIX_KEY || '82988181358', // Chave PIX configurada
      beneficiario: {
        nome: 'SementesPLAY',
        cpf: process.env.PIX_CPF || '12345678901'
      },
      descricao: `Repasse - ${repasse.compra.usuario.nome} - R$ ${repasse.valor.toFixed(2)}`,
      expiracao: 3600 // 1 hora
    }

    // Atualizar repasse com ID do pagamento
    await prisma.repasseParceiro.update({
      where: { id: String(repasseId) },
      data: { 
        paymentId,
        status: 'aguardando_pagamento'
      }
    })

    // Retornar dados do PIX
    res.status(200).json({
      success: true,
      paymentId,
      pixData,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(pixData))}`,
      instrucoes: [
        '1. Abra seu app bancário',
        '2. Escaneie o QR Code ou copie a chave PIX',
        '3. Confirme o pagamento',
        '4. Aguarde a confirmação automática'
      ]
    })

  } catch (error) {
    console.error('Erro ao gerar pagamento PIX:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 