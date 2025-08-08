import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    let paymentId, pagamentoId
    
    if (req.method === 'POST') {
      // Para requisições POST, pegar do body
      const body = req.body
      paymentId = body.paymentId
      pagamentoId = body.pagamentoId
    } else {
      // Para requisições GET, pegar dos query parameters
      paymentId = req.query.paymentId as string
      pagamentoId = req.query.pagamentoId as string
    }

    if (!paymentId) {
      return res.status(400).json({ error: 'PaymentId obrigatório não fornecido' })
    }

    // Configurar access token do Mercado Pago
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    
    if (!accessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN não configurado')
      return res.status(500).json({ error: 'Configuração não disponível' })
    }

    // Buscar detalhes do pagamento via API do Mercado Pago
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('Erro ao buscar pagamento no MercadoPago:', response.status)
      return res.status(400).json({ error: 'Erro ao verificar pagamento' })
    }

    const payment = await response.json()
    console.log('Status do pagamento:', payment.status)

    if (payment.status === 'approved') {
      // Pagamento aprovado - processar automaticamente
      console.log(`Pagamento aprovado: ${payment.id}`)

      // Se não tiver pagamentoId, apenas retornar o status
      if (!pagamentoId) {
        return res.status(200).json({ 
          success: true, 
          status: 'approved',
          message: 'Pagamento aprovado no Mercado Pago',
          paymentId: payment.id
        })
      }

      // Buscar o pagamento no banco de dados
      const pagamento = await prisma.pagamento.findUnique({
        where: { id: pagamentoId },
        include: { usuario: true }
      })

      if (!pagamento) {
        return res.status(404).json({ error: 'Pagamento não encontrado' })
      }

      if (pagamento.status === 'aprovado') {
        return res.status(200).json({ 
          success: true, 
          status: 'aprovado',
          message: 'Pagamento já foi processado',
          sementesGeradas: pagamento.sementesGeradas
        })
      }

      // Calcular sementes (1 Real = 1 Semente)
      const sementesGeradas = Math.floor(pagamento.valor)

      // Transação: processar tudo de uma vez
      await prisma.$transaction(async (tx) => {
        // 1. Atualizar status do pagamento
        await tx.pagamento.update({
          where: { id: pagamentoId },
          data: { 
            status: 'aprovado',
            sementesGeradas: sementesGeradas,
            dataPagamento: new Date()
          }
        })

        // 2. Creditar sementes para o usuário
        await tx.usuario.update({
          where: { id: pagamento.usuarioId },
          data: { sementes: { increment: sementesGeradas } }
        })

        // 3. Criar registro de semente
        await tx.semente.create({
          data: {
            usuarioId: pagamento.usuarioId,
            quantidade: sementesGeradas,
            tipo: 'comprada',
            descricao: `Compra de sementes via PIX - R$ ${pagamento.valor}`
          }
        })

        // 4. Verificar se existe carteira digital, se não, criar
        let carteira = await tx.carteiraDigital.findUnique({
          where: { usuarioId: pagamento.usuarioId }
        })

        if (!carteira) {
          carteira = await tx.carteiraDigital.create({
            data: {
              usuarioId: pagamento.usuarioId,
              saldo: sementesGeradas,
              dataCriacao: new Date()
            }
          })
        } else {
          // Atualizar saldo da carteira
          await tx.carteiraDigital.update({
            where: { id: carteira.id },
            data: { saldo: { increment: sementesGeradas } }
          })
        }

        // 5. Criar movimentação na carteira
        await tx.movimentacaoCarteira.create({
          data: {
            carteiraId: carteira.id,
            tipo: 'credito',
            valor: sementesGeradas,
            saldoAnterior: carteira.saldo,
            saldoPosterior: carteira.saldo + sementesGeradas,
            descricao: `Compra de sementes via PIX - R$ ${pagamento.valor}`,
            status: 'processado',
            referencia: pagamentoId
          }
        })
      })

      // Criar notificação
      try {
        await prisma.notificacao.create({
          data: {
            usuarioId: pagamento.usuarioId,
            titulo: 'Pagamento Aprovado!',
            mensagem: `Seu pagamento de R$ ${pagamento.valor} foi aprovado! Você recebeu ${sementesGeradas} sementes.`,
            tipo: 'pagamento',
            lida: false
          }
        })
      } catch (notifError) {
        console.log('Erro ao criar notificação (pode ser ignorado):', notifError)
      }

      return res.status(200).json({ 
        success: true, 
        status: 'aprovado',
        message: 'Pagamento aprovado e sementes creditadas com sucesso!',
        sementesGeradas: sementesGeradas,
        valor: pagamento.valor
      })

    } else if (payment.status === 'pending') {
      return res.status(200).json({ 
        success: true, 
        status: 'pending',
        message: 'Pagamento ainda está pendente'
      })
    } else if (payment.status === 'rejected') {
      // Se tiver pagamentoId, atualizar status do pagamento para rejeitado
      if (pagamentoId) {
        await prisma.pagamento.update({
          where: { id: pagamentoId },
          data: { status: 'rejeitado' }
        })
      }

      return res.status(200).json({ 
        success: true, 
        status: 'rejected',
        message: 'Pagamento foi rejeitado'
      })
    } else {
      return res.status(200).json({ 
        success: true, 
        status: payment.status,
        message: `Status do pagamento: ${payment.status}`
      })
    }

  } catch (error) {
    console.error('Erro ao verificar pagamento:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 