import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { enviarNotificacao } from '../../../lib/notificacao'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 Webhook recebido do MercadoPago')
  console.log('📝 Método:', req.method)
  console.log('📦 Body:', req.body)
  console.log('📋 Headers:', req.headers)

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Aceitar qualquer formato - ser mais flexível
    const { data, id, type, action, api_version, date_created, live_mode, user_id } = req.body

    // Extrair paymentId de qualquer lugar possível
    let paymentId = null
    if (data && data.id) paymentId = data.id
    else if (id) paymentId = id
    else if (req.body.payment_id) paymentId = req.body.payment_id

    console.log('💰 Payment ID extraído:', paymentId)
    console.log('📋 Tipo:', type, 'Ação:', action)

    // Se não temos paymentId, retornar sucesso mesmo assim (webhook de teste)
    if (!paymentId) {
      console.log('⚠️ Nenhum paymentId encontrado - webhook de teste')
      return res.status(200).json({ 
        success: true, 
        message: 'Webhook de teste recebido com sucesso',
        received: req.body
      })
    }

    // Configurar access token
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    
    if (!accessToken) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN não configurado')
      return res.status(500).json({ error: 'Configuração não disponível' })
    }
    
    console.log('🔑 Access token configurado, buscando pagamento...')
    
    // Buscar detalhes do pagamento via API direta
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('❌ Erro ao buscar pagamento no MercadoPago:', response.status)
      return res.status(400).json({ error: 'Erro ao verificar pagamento' })
    }

    const payment = await response.json()
    console.log('✅ Status do pagamento:', payment.status)

    if (payment.status === 'approved') {
      // Pagamento aprovado - processar automaticamente
      console.log(`🎉 Pagamento aprovado: ${payment.id}`)

      // Buscar a compra específica que corresponde a este pagamento
      const compra = await prisma.compraParceiro.findFirst({
        where: {
          status: 'aguardando_repasse',
          // Aqui podemos adicionar mais critérios se necessário
          // Por enquanto, vamos processar a mais recente
        },
        include: {
          parceiro: {
            include: {
              usuario: true
            }
          },
          usuario: true,
          repasse: true
        },
        orderBy: {
          dataCompra: 'desc'
        }
      })

      if (compra) {
        console.log(`⚙️ Processando compra: ${compra.id} para paymentId: ${payment.id}`)

        // Calcular valor do repasse (10% da compra)
        const valorRepasse = compra.valorCompra * 0.10
        const pctUsuario = valorRepasse * 0.50    // 50% para usuário (em sementes)
        const pctSistema = valorRepasse * 0.25    // 25% para sistema (em reais)
        const pctFundo = valorRepasse * 0.25      // 25% para fundo (em reais)

        // Transação: processar tudo de uma vez
        await prisma.$transaction(async (tx) => {
          // 1. Atualizar status da compra
          await tx.compraParceiro.update({
            where: { id: compra.id },
            data: { status: 'cashback_liberado' }
          })

          // 2. Criar repasse
          await tx.repasseParceiro.create({
            data: {
              parceiroId: compra.parceiroId,
              compraId: compra.id,
              valor: valorRepasse,
              status: 'pago',
              dataRepasse: new Date(),
              paymentId: payment.id.toString()
            }
          })

          // 3. Creditar sementes para o usuário
          await tx.usuario.update({
            where: { id: compra.usuarioId },
            data: { sementes: { increment: pctUsuario } }
          })

          // 4. Criar registro de semente
          await tx.semente.create({
            data: {
              usuarioId: compra.usuarioId,
              quantidade: pctUsuario,
              tipo: 'resgatada',
              descricao: `Cashback compra parceiro ${compra.id} - Webhook MercadoPago`
            }
          })
        })

        // Operações fora da transação
        try {
          // Atualizar fundo de sementes
          const fundoSementes = await prisma.fundoSementes.findFirst({
            where: { distribuido: false }
          })
          
          if (fundoSementes) {
            await prisma.fundoSementes.update({
              where: { id: fundoSementes.id },
              data: { valorTotal: { increment: pctFundo } }
            })
          } else {
            // Criar novo fundo se não existir
            await prisma.fundoSementes.create({
              data: {
                ciclo: 1,
                valorTotal: pctFundo,
                dataInicio: new Date(),
                dataFim: new Date(),
                distribuido: false
              }
            })
          }

          // Criar notificação
          await prisma.notificacao.create({
            data: {
              usuarioId: compra.usuarioId,
              titulo: 'Cashback Liberado!',
              mensagem: `Seu cashback de R$ ${valorRepasse.toFixed(2)} foi liberado automaticamente! Você recebeu ${pctUsuario} sementes.`,
              tipo: 'cashback',
              lida: false
            }
          })

          console.log('🎯 Repasse processado com sucesso via webhook:', compra.id)

          return res.status(200).json({ 
            success: true, 
            message: 'Pagamento processado com sucesso',
            compraId: compra.id,
            paymentId: String(payment.id)
          })

        } catch (error) {
          console.error('⚠️ Erro nas operações secundárias:', error)
          return res.status(200).json({ 
            success: true, 
            message: 'Pagamento processado com avisos',
            compraId: compra.id,
            paymentId: String(payment.id)
          })
        }

      } else {
        console.log('ℹ️ Nenhuma compra pendente encontrada para processar')
        return res.status(200).json({ 
          success: true, 
          message: 'Pagamento aprovado - nenhuma compra pendente',
          paymentId: String(payment.id)
        })
      }
    } else {
      console.log('ℹ️ Pagamento não aprovado:', payment.status)
      return res.status(200).json({ 
        success: true, 
        message: 'Webhook recebido - pagamento não aprovado',
        status: payment.status
      })
    }

  } catch (error) {
    console.error('❌ Erro no webhook:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}