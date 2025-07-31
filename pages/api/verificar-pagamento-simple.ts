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

    console.log('Verificando pagamento:', paymentId)

    // Simular verificação de pagamento
    // Em produção, aqui você faria uma requisição para o Mercado Pago
    const status = Math.random() > 0.7 ? 'approved' : 'pending'

    return res.status(200).json({
      paymentId,
      status,
      message: status === 'approved' ? 'Pagamento aprovado!' : 'Pagamento pendente'
    })

  } catch (error) {
    console.error('Erro ao verificar pagamento:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 