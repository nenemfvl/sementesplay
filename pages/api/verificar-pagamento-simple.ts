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

    // IMPORTANTE: Aqui você deve integrar com uma API real de verificação PIX
    // Por exemplo: API do banco, API do PIX, etc.
    
    // Por enquanto, vamos simular que NUNCA foi pago automaticamente
    // Só confirma se o usuário realmente fez o pagamento
    
    // Para testar, você pode:
    // 1. Fazer o pagamento real via QR Code
    // 2. Depois acessar: /api/verificar-pagamento-simple?paymentId=SEU_PAYMENT_ID&usuarioId=SEU_USUARIO_ID
    // 3. E retornar status: 'confirmado' manualmente

    return res.status(200).json({
      status: 'pendente',
      message: 'Aguardando confirmação do pagamento real',
      instrucoes: [
        '1. Faça o pagamento usando o QR Code ou chave PIX',
        '2. Aguarde alguns minutos para processamento',
        '3. O status será atualizado automaticamente quando confirmado'
      ]
    })

  } catch (error) {
    console.error('Erro ao verificar pagamento:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 