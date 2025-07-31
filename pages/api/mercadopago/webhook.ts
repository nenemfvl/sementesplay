import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { data } = req.body

    if (data && data.id) {
      // Configurar access token
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-123456789'
      
      // Buscar detalhes do pagamento via API direta
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const payment = await response.json()

      if (payment.status === 'approved') {
        // Pagamento aprovado
        const repasseId = payment.external_reference

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