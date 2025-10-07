import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Verificar se é uma chamada autorizada (do Vercel Cron ou com secret)
    const authHeader = req.headers.authorization
    const cronSecret = process.env.CRON_SECRET
    
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Não autorizado' })
    }

    console.log('⏰ CRON JOB: Verificando distribuição automática do fundo...')

    // Chamar a API de distribuição automática
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/cron/distribuir-fundo-automatico`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    const resultado = await response.json()

    if (response.ok) {
      console.log('✅ Cron job executado com sucesso:', resultado.message)
      return res.status(200).json({
        message: 'Cron job executado com sucesso',
        resultado
      })
    } else {
      console.log('⚠️ Cron job executado com aviso:', resultado.error)
      return res.status(200).json({
        message: 'Cron job executado com aviso',
        resultado
      })
    }

  } catch (error) {
    console.error('❌ Erro no cron job:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
