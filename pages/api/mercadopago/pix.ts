import { NextApiRequest, NextApiResponse } from 'next'
import QRCode from 'qrcode'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { repasseId, parceiroId, usuarioId, valor } = req.body

    console.log('🔍 DADOS RECEBIDOS NA API PIX:')
    console.log('   repasseId:', repasseId)
    console.log('   parceiroId:', parceiroId)
    console.log('   usuarioId:', usuarioId)
    console.log('   valor:', valor)

    if (!repasseId || !parceiroId || !usuarioId || !valor) {
      console.log('Dados obrigatórios não fornecidos')
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' })
    }

    const valorRepasse = parseFloat(valor)

    if (isNaN(valorRepasse) || valorRepasse <= 0) {
      console.log('Valor inválido:', valor)
      return res.status(400).json({ error: 'Valor inválido' })
    }

    // Arredondar para 2 casas decimais para evitar problemas de precisão
    const valorRepasseArredondado = Math.round(valorRepasse * 100) / 100
    console.log('💰 Valor original:', valorRepasse)
    console.log('💰 Valor arredondado:', valorRepasseArredondado)

    // Configurar access token do Mercado Pago
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    
    console.log('Access Token configurado:', accessToken ? 'SIM' : 'NÃO')
    console.log('Access Token (primeiros 10 chars):', accessToken ? accessToken.substring(0, 10) + '...' : 'NÃO')
    
    if (!accessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN não configurado')
      return res.status(500).json({ 
        error: 'Configuração de pagamento não disponível',
        message: 'Configure a variável MERCADOPAGO_ACCESS_TOKEN no Vercel'
      })
    }

    // Criar pagamento PIX no Mercado Pago
    const payment_data = {
      transaction_amount: valorRepasseArredondado,
      description: `Repasse Parceiro - R$ ${valorRepasseArredondado.toFixed(2)}`,
      payment_method_id: 'pix',
      payer: {
        email: 'parceiro@sementesplay.com.br',
        first_name: 'Parceiro',
        last_name: 'SementesPLAY'
      },
      external_reference: repasseId,
      notification_url: 'https://sementesplay.com.br/api/mercadopago/webhook'
    }

    console.log('Criando pagamento no Mercado Pago:', JSON.stringify(payment_data, null, 2))

    // Fazer requisição para a API do Mercado Pago
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${repasseId}-${Date.now()}`
      },
      body: JSON.stringify(payment_data)
    })

    console.log('Status da resposta Mercado Pago:', response.status)
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ ERRO NA API DO MERCADO PAGO:')
      console.error('   Status:', response.status)
      console.error('   Erro:', JSON.stringify(errorData, null, 2))
      console.error('   Payment data enviado:', JSON.stringify(payment_data, null, 2))
      
      return res.status(400).json({ 
        error: 'Erro ao gerar PIX',
        details: errorData.message || 'Erro na integração com Mercado Pago',
        mercadopago_error: errorData,
        status: response.status,
        debug_info: {
          access_token_length: accessToken.length,
          access_token_start: accessToken.substring(0, 10) + '...',
          payment_data: payment_data
        }
      })
    }

    const payment = await response.json()
    console.log('Pagamento criado no Mercado Pago:', payment.id)

    // Verificar se o repasse existe, se não, criar
    try {
      let repasseExistente = await prisma.repasseParceiro.findUnique({
        where: { id: repasseId }
      })

      if (!repasseExistente) {
        console.log('Repasse não encontrado, criando novo repasse...')
        
        // Buscar compra relacionada
        const compra = await prisma.compraParceiro.findFirst({
          where: {
            parceiroId: parceiroId,
            status: 'aguardando_repasse'
          },
          orderBy: { dataCompra: 'desc' }
        })

        if (!compra) {
          console.log('Nenhuma compra aguardando repasse encontrada')
          return res.status(400).json({ 
            error: 'Nenhuma compra aguardando repasse',
            message: 'Não há compras pendentes para criar repasse'
          })
        }

        // Criar novo repasse
        repasseExistente = await prisma.repasseParceiro.create({
          data: {
            id: repasseId,
            parceiroId: parceiroId,
            compraId: compra.id,
            valor: valorRepasseArredondado, // Usar valor arredondado
            status: 'aguardando_pagamento',
            paymentId: String(payment.id),
            dataRepasse: new Date()
          }
        })
        console.log('Novo repasse criado:', repasseExistente.id)
      } else {
        if (repasseExistente.status === 'pago' || repasseExistente.status === 'confirmado') {
          console.log('Repasse já foi pago, não atualizando')
          return res.status(400).json({ 
            error: 'Repasse já foi pago',
            message: 'Este repasse já foi processado e não pode ser pago novamente'
          })
        }

        await prisma.repasseParceiro.update({
          where: { id: repasseId },
          data: { 
            paymentId: String(payment.id),
            status: 'aguardando_pagamento'
          }
        })
        console.log('PaymentId salvo no repasse:', payment.id)
      }
    } catch (dbError) {
      console.log('Erro ao criar/atualizar repasse:', dbError)
      return res.status(500).json({ 
        error: 'Erro ao processar repasse',
        message: 'Não foi possível criar ou atualizar o repasse'
      })
    }

    if (payment.status === 'pending' && payment.payment_method_id === 'pix') {
      const pixData = payment.point_of_interaction?.transaction_data

      if (!pixData) {
        console.error('Dados PIX não disponíveis no pagamento:', payment)
        return res.status(400).json({ error: 'Dados PIX não disponíveis' })
      }

      return res.status(200).json({
        paymentId: payment.id,
        pixData: {
          chavePix: pixData.qr_code,
          beneficiario: {
            nome: 'SementesPLAY',
            cpf: '093.827.074-50'
          },
          valor: valorRepasse,
          descricao: `Repasse Parceiro - R$ ${valorRepasse.toFixed(2)}`,
          expiracao: 3600
        },
        pixCode: `data:image/png;base64,${pixData.qr_code_base64}`,
        qrCode: pixData.qr_code,
        instrucoes: [
          '1. Abra seu app bancário',
          '2. Escaneie o QR Code ou cole o código PIX',
          `3. Confirme o valor: R$ ${valorRepasse.toFixed(2)}`,
          '4. Confirme o beneficiário: SementesPLAY',
          '5. Faça o pagamento',
          '6. Aguarde a confirmação automática'
        ],
        status: 'pendente',
        mercadopago_payment_id: payment.id
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