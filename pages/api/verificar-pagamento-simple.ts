import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { paymentId, usuarioId } = req.query

    if (!paymentId || typeof paymentId !== 'string' || !usuarioId) {
      return res.status(400).json({ error: 'PaymentId e usuarioId obrigatórios' })
    }

    // Simular verificação de pagamento
    const tempoDecorrido = Date.now() - parseInt(paymentId.split('_')[1])
    const confirmado = tempoDecorrido > 10000 // 10 segundos para simular confirmação

    if (confirmado) {
      return res.status(200).json({
        status: 'confirmado',
        message: 'Pagamento confirmado com sucesso!'
      })
    }

    return res.status(200).json({
      status: 'pendente',
      message: 'Aguardando confirmação do pagamento'
    })

  } catch (error) {
    console.error('Erro ao verificar pagamento:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 