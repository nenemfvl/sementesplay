import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    console.log('🔍 Webhook de teste recebido')
    console.log('📝 Headers:', req.headers)
    console.log('📦 Body:', req.body)
    console.log('📊 Query:', req.query)

    // Simular o formato que o Mercado Pago envia
    const { data, type, action, api_version, date_created, id, live_mode, user_id } = req.body

    if (!data || !data.id) {
      console.log('❌ Dados inválidos recebidos')
      return res.status(400).json({ 
        error: 'Dados inválidos',
        received: req.body,
        expected: 'data.id é obrigatório'
      })
    }

    console.log('✅ Dados válidos recebidos')
    console.log('💰 Payment ID:', data.id)
    console.log('📋 Type:', type)
    console.log('🎯 Action:', action)

    return res.status(200).json({ 
      success: true, 
      message: 'Webhook de teste processado com sucesso',
      received: {
        paymentId: data.id,
        type,
        action,
        api_version,
        date_created,
        id,
        live_mode,
        user_id
      }
    })

  } catch (error) {
    console.error('❌ Erro no webhook de teste:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}
