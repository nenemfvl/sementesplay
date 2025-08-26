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

    // Aceitar o formato exato que o Mercado Pago envia
    const { action, api_version, data, date_created, id, live_mode, type, user_id } = req.body

    console.log('✅ Dados recebidos do Mercado Pago:')
    console.log('🎯 Action:', action)
    console.log('📋 Type:', type)
    console.log('💰 Payment ID:', data?.id)
    console.log('🌐 API Version:', api_version)
    console.log('📅 Date Created:', date_created)
    console.log('🆔 ID:', id)
    console.log('🔴 Live Mode:', live_mode)
    console.log('👤 User ID:', user_id)

    // Simular processamento bem-sucedido
    return res.status(200).json({ 
      success: true, 
      message: 'Webhook de teste processado com sucesso',
      received: {
        action,
        type,
        paymentId: data?.id,
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
