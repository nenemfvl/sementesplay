import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { paymentId } = req.query

    if (!paymentId) {
      return res.status(400).json({ error: 'ID do pagamento não fornecido' })
    }

    console.log('Verificando pagamento no MercadoPago:', paymentId)

    // Configurar access token do Mercado Pago
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    
    if (!accessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN não configurado')
      return res.status(500).json({ 
        error: 'Configuração de pagamento não disponível',
        message: 'Configure a variável MERCADOPAGO_ACCESS_TOKEN no Vercel'
      })
    }

    // Consultar pagamento na API do Mercado Pago
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Erro na API do Mercado Pago:', JSON.stringify(errorData, null, 2))
      return res.status(400).json({ 
        error: 'Erro ao verificar pagamento',
        details: errorData.message || 'Erro na integração com Mercado Pago',
        mercadopago_error: errorData,
        status: response.status
      })
    }

    const payment = await response.json()
    console.log('Status do pagamento no MercadoPago:', payment.status)

    // Mapear status do MercadoPago para nosso sistema
    let status = 'pending'
    let message = 'Pagamento pendente'

    switch (payment.status) {
      case 'approved':
        status = 'confirmado'
        message = 'Pagamento aprovado!'
        break
      case 'pending':
        status = 'pending'
        message = 'Pagamento pendente'
        break
      case 'in_process':
        status = 'pending'
        message = 'Pagamento em processamento'
        break
      case 'rejected':
        status = 'rejeitado'
        message = 'Pagamento rejeitado'
        break
      case 'cancelled':
        status = 'cancelado'
        message = 'Pagamento cancelado'
        break
      case 'refunded':
        status = 'reembolsado'
        message = 'Pagamento reembolsado'
        break
      default:
        status = 'pending'
        message = 'Status desconhecido'
    }

    return res.status(200).json({
      paymentId,
      status,
      message,
      mercadopago_status: payment.status,
      transaction_amount: payment.transaction_amount,
      external_reference: payment.external_reference,
      date_created: payment.date_created,
      date_approved: payment.date_approved
    })

  } catch (error) {
    console.error('Erro ao verificar pagamento:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 