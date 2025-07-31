import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Verificar autenticação via cookie
    const cookies = req.headers.cookie
    if (!cookies) {
      return res.status(401).json({ error: 'Não autorizado' })
    }

    const userCookie = cookies.split(';').find(c => c.trim().startsWith('sementesplay_user='))
    if (!userCookie) {
      return res.status(401).json({ error: 'Não autorizado' })
    }

    const userData = decodeURIComponent(userCookie.split('=')[1])
    const user = JSON.parse(userData)

    if (!user?.id) {
      return res.status(401).json({ error: 'Não autorizado' })
    }

    const { repasseId, parceiroId, usuarioId, valor } = req.body

    if (!repasseId || !parceiroId || !usuarioId || !valor) {
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' })
    }

    // Verificar se o usuário é o parceiro correto
    const parceiro = await prisma.parceiro.findFirst({
      where: {
        id: parceiroId,
        usuarioId: user.id
      }
    })

    if (!parceiro) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    const valorRepasse = parseFloat(valor)

    if (isNaN(valorRepasse) || valorRepasse <= 0) {
      return res.status(400).json({ error: 'Valor inválido' })
    }

    // Criar pagamento PIX no Mercado Pago
    const payment_data = {
      transaction_amount: valorRepasse,
      description: `Repasse Parceiro - R$ ${valorRepasse.toFixed(2)}`,
      payment_method_id: 'pix',
      payer: {
        email: 'parceiro@sementesplay.com',
        first_name: 'Parceiro',
        last_name: 'SementesPLAY'
      },
      external_reference: repasseId,
      notification_url: `${process.env.NEXTAUTH_URL || 'https://sementesplay.vercel.app'}/api/mercadopago/webhook`
    }

    // Configurar access token
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    
    if (!accessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN não configurado')
      return res.status(500).json({ error: 'Configuração de pagamento não disponível' })
    }
    
    // Fazer requisição direta para a API do Mercado Pago
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payment_data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Erro na API do Mercado Pago:', errorData)
      return res.status(400).json({ 
        error: 'Erro ao gerar PIX',
        details: errorData.message || 'Erro na integração com Mercado Pago'
      })
    }

    const payment = await response.json()

    if (payment.status === 'pending' && payment.payment_method_id === 'pix') {
      const pixData = payment.point_of_interaction?.transaction_data

      if (!pixData) {
        return res.status(400).json({ error: 'Dados PIX não disponíveis' })
      }

      return res.status(200).json({
        paymentId: payment.id,
        pixData: {
          chavePix: pixData.qr_code,
          beneficiario: {
            nome: 'SementesPLAY',
            cpf: '12345678901'
          },
          valor: valorRepasse,
          descricao: `Repasse Parceiro - R$ ${valorRepasse.toFixed(2)}`,
          expiracao: 3600
        },
        pixCode: pixData.qr_code_base64,
        qrCode: pixData.qr_code,
        instrucoes: [
          '1. Abra seu app bancário',
          '2. Escaneie o QR Code ou cole o código PIX',
          `3. Confirme o valor: R$ ${valorRepasse.toFixed(2)}`,
          '4. Confirme o beneficiário: SementesPLAY',
          '5. Faça o pagamento',
          '6. Aguarde a confirmação automática'
        ],
        status: 'pendente'
      })
    } else {
      console.error('Status de pagamento inválido:', payment)
      return res.status(400).json({ error: 'Erro ao gerar PIX - status inválido' })
    }

  } catch (error) {
    console.error('Erro ao gerar PIX Mercado Pago:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 