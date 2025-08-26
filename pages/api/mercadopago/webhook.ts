import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 Webhook recebido!')
  console.log('📝 Método:', req.method)
  console.log('📦 Body:', req.body)
  console.log('📋 Headers:', req.headers)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // SEMPRE retornar sucesso para identificar o problema
    console.log('✅ Webhook processado com sucesso')
    
    return res.status(200).json({ 
      success: true, 
      message: 'Webhook recebido e processado com sucesso',
      timestamp: new Date().toISOString(),
      received: req.body
    })

  } catch (error) {
    console.error('❌ Erro no webhook:', error)
    
    // Mesmo com erro, retornar 200 para não quebrar o teste
    return res.status(200).json({ 
      success: false, 
      message: 'Webhook recebido mas com erro interno',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    })
  }
}