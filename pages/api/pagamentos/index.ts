import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Verificar autenticação via cookie
      let user = null
      const userCookie = req.cookies['sementesplay_user']
      
      if (userCookie) {
        try {
          user = JSON.parse(decodeURIComponent(userCookie))
        } catch (error) {
          console.error('Erro ao decodificar cookie do usuário:', error)
        }
      }

      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      const { usuarioId, tipo, valor } = req.body

      if (!usuarioId || !tipo || !valor) {
        return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' })
      }

      if (usuarioId !== user.id) {
        return res.status(403).json({ error: 'Acesso negado' })
      }

      if (valor < 1) {
        return res.status(400).json({ error: 'Valor mínimo de R$ 1,00' })
      }

      // Configurar access token do Mercado Pago
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
      
      if (!accessToken) {
        console.error('MERCADOPAGO_ACCESS_TOKEN não configurado')
        return res.status(500).json({ 
          error: 'Configuração de pagamento não disponível',
          message: 'Configure a variável MERCADOPAGO_ACCESS_TOKEN no Vercel'
        })
      }

      // Criar registro de pagamento pendente
      const pagamento = await prisma.pagamento.create({
        data: {
          usuarioId: String(usuarioId),
          tipo: String(tipo),
          valor: parseFloat(valor),
          sementesGeradas: 0, // Será atualizado após confirmação
          gateway: 'mercadopago',
          status: 'pendente',
          dadosPagamento: JSON.stringify({ tipo, valor }),
          dataPagamento: new Date()
        }
      })

      // Criar pagamento PIX no Mercado Pago
      const payment_data = {
        transaction_amount: parseFloat(valor),
        description: `Compra de Sementes - R$ ${valor}`,
        payment_method_id: 'pix',
        payer: {
          email: user.email || 'usuario@sementesplay.com.br',
          first_name: user.nome?.split(' ')[0] || 'Usuário',
          last_name: user.nome?.split(' ').slice(1).join(' ') || 'SementesPLAY'
        },
        external_reference: pagamento.id,
        notification_url: 'https://sementesplay.com.br/api/mercadopago/webhook'
      }

      // Fazer requisição para a API do Mercado Pago
      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': `${pagamento.id}-${Date.now()}`
        },
        body: JSON.stringify(payment_data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Erro na API do Mercado Pago:', errorData)
        
        // Atualizar status do pagamento para erro
        await prisma.pagamento.update({
          where: { id: pagamento.id },
          data: { status: 'erro' }
        })
        
        return res.status(400).json({ 
          error: 'Erro ao gerar PIX',
          details: errorData.message || 'Erro na integração com Mercado Pago'
        })
      }

      const payment = await response.json()

      // Atualizar pagamento com o ID do Mercado Pago
      await prisma.pagamento.update({
        where: { id: pagamento.id },
        data: { 
          gatewayId: payment.id.toString(),
          status: 'pendente'
        }
      })

      if (payment.status === 'pending' && payment.payment_method_id === 'pix') {
        const pixData = payment.point_of_interaction?.transaction_data

        if (!pixData) {
          return res.status(400).json({ error: 'Dados PIX não disponíveis' })
        }

        return res.status(200).json({
          success: true,
          paymentId: String(payment.id),
          pagamentoId: pagamento.id,
          pixData: {
            chavePix: pixData.qr_code,
            beneficiario: {
              nome: 'SementesPLAY',
              cpf: '093.827.074-50'
            },
            valor: valor,
            descricao: `Compra de Sementes - R$ ${valor}`,
            expiracao: 3600
          },
          pixCode: `data:image/png;base64,${pixData.qr_code_base64}`,
          qrCode: pixData.qr_code,
          instrucoes: [
            '1. Abra seu app bancário',
            '2. Escaneie o QR Code ou cole o código PIX',
            `3. Confirme o valor: R$ ${valor}`,
            '4. Confirme o beneficiário: SementesPLAY',
            '5. Faça o pagamento',
            '6. Aguarde a confirmação automática'
          ],
          status: 'pendente',
          mercadopago_payment_id: payment.id
        })
      } else {
        return res.status(400).json({ error: 'Erro ao gerar PIX - status inválido' })
      }

    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ error: 'Método não permitido' })
  }
} 