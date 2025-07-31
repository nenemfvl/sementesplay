import { NextApiRequest, NextApiResponse } from 'next'
import mercadopago from 'mercadopago'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { repasseId, parceiroId, usuarioId, valor } = req.body

    if (!repasseId || !parceiroId || !usuarioId || !valor) {
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' })
    }

    const valorRepasse = parseFloat(valor)

    // Configurar Mercado Pago
    mercadopago.configure({
      access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-123456789'
    })

    // Criar pagamento PIX no Mercado Pago
    const payment_data = {
      transaction_amount: valorRepasse,
      description: `Repasse Parceiro - R$ ${valorRepasse.toFixed(2)}`,
      payment_method_id: 'pix',
      payer: {
        email: 'parceiro@sementesplay.com',
        first_name: 'Parceiro',
        last_name: 'SementesPLAY'
      },
      external_reference: repasseId,
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago/webhook`
    }

    const payment = await mercadopago.payment.save(payment_data)

    if (payment.body.status === 'pending' && payment.body.payment_method_id === 'pix') {
      const pixData = payment.body.point_of_interaction.transaction_data

      return res.status(200).json({
        paymentId: payment.body.id,
        pixData: {
          chavePix: pixData.qr_code,
          beneficiario: {
            nome: 'SementesPLAY',
            cpf: '12345678901'
          },
          valor: valorRepasse,
          descricao: `Repasse Parceiro - R$ ${valorRepasse.toFixed(2)}`,
          expiracao: 3600
        },
        pixCode: pixData.qr_code_base64,
        qrCode: pixData.qr_code,
        instrucoes: [
          '1. Abra seu app bancário',
          '2. Escaneie o QR Code ou cole o código PIX',
          `3. Confirme o valor: R$ ${valorRepasse.toFixed(2)}`,
          '4. Confirme o beneficiário: SementesPLAY',
          '5. Faça o pagamento',
          '6. Aguarde a confirmação automática'
        ],
        status: 'pendente'
      })
    } else {
      return res.status(400).json({ error: 'Erro ao gerar PIX' })
    }

  } catch (error) {
    console.error('Erro ao gerar PIX Mercado Pago:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 