import { NextApiRequest, NextApiResponse } from 'next'
import mercadopago from 'mercadopago'

// Configurar Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-123456789'
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { data } = req.body

    if (data && data.id) {
      // Buscar detalhes do pagamento
      const payment = await mercadopago.payment.findById(data.id)

      if (payment.body.status === 'approved') {
        // Pagamento aprovado
        const repasseId = payment.body.external_reference

        // Aqui você pode atualizar o status do repasse no banco
        console.log(`Pagamento aprovado para repasse: ${repasseId}`)

        // TODO: Atualizar status do repasse para 'pago'
        // TODO: Liberar cashback para o usuário
        // TODO: Enviar notificação

        return res.status(200).json({ 
          success: true, 
          message: 'Pagamento processado com sucesso' 
        })
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Webhook recebido' 
    })

  } catch (error) {
    console.error('Erro no webhook Mercado Pago:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 