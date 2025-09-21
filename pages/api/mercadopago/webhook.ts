import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { adicionarAoFundoAtivoTx } from '../../../lib/fundo-utils'
import { enviarNotificacao } from '../../../lib/notificacao'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 Webhook recebido do MercadoPago')
  console.log('📝 Método:', req.method)
  console.log('📦 Body:', req.body)
  console.log('📋 Headers:', req.headers)

  // Adicionar CORS headers para permitir requisições do Mercado Pago
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Validar se o body existe e tem conteúdo
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('⚠️ Body vazio recebido')
      return res.status(200).json({ 
        success: true, 
        message: 'Webhook recebido com sucesso (body vazio)'
      })
    }

    // Log mais detalhado para debug
    console.log('🔍 Dados do webhook recebidos:', {
      bodyKeys: Object.keys(req.body),
      bodyType: typeof req.body,
      contentType: req.headers['content-type']
    })

    // Extrair dados do webhook de forma mais flexível
    const { 
      data, 
      id, 
      type, 
      action, 
      api_version, 
      date_created, 
      live_mode, 
      user_id,
      payment_id,
      external_reference
    } = req.body

    console.log('📋 Dados do webhook:', {
      type,
      action,
      id,
      payment_id,
      external_reference,
      data
    })

    // Se é um webhook de teste ou não tem dados relevantes, retornar sucesso
    if (!type || !action || (!id && !payment_id && !data?.id)) {
      console.log('⚠️ Webhook de teste ou sem dados relevantes')
      console.log('📋 Dados recebidos:', req.body)
      return res.status(200).json({ 
        success: true, 
        message: 'Webhook recebido com sucesso',
        received: req.body
      })
    }

    // Validar se é um webhook de pagamento
    if (type !== 'payment') {
      console.log('⚠️ Webhook não é de pagamento:', type)
      return res.status(200).json({ 
        success: true, 
        message: 'Webhook recebido - não é de pagamento',
        type: type
      })
    }

    // Determinar o ID do pagamento
    let paymentId = null
    if (data && data.id) paymentId = data.id
    else if (id) paymentId = id
    else if (payment_id) paymentId = payment_id

    if (!paymentId) {
      console.log('⚠️ Nenhum paymentId encontrado')
      return res.status(200).json({ 
        success: true, 
        message: 'Webhook recebido - sem paymentId',
        received: req.body
      })
    }

    console.log('💰 Payment ID:', paymentId)
    console.log('📋 Tipo:', type, 'Ação:', action)

    // Configurar access token
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    
    if (!accessToken) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN não configurado')
      return res.status(500).json({ error: 'Configuração não disponível' })
    }
    
    console.log('🔑 Access token configurado, buscando pagamento...')
    
    // Buscar detalhes do pagamento via API do Mercado Pago
    let payment
    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('❌ Erro ao buscar pagamento no MercadoPago:', response.status)
        return res.status(200).json({ 
          success: false, 
          message: 'Erro ao verificar pagamento',
          error: `Status: ${response.status}`
        })
      }

      payment = await response.json()
      console.log('✅ Status do pagamento:', payment.status)
      console.log('📋 Dados do pagamento:', {
        id: payment.id,
        status: payment.status,
        external_reference: payment.external_reference,
        amount: payment.transaction_amount
      })
    } catch (fetchError) {
      console.error('❌ Erro na requisição para Mercado Pago:', fetchError)
      return res.status(200).json({ 
        success: false, 
        message: 'Erro na comunicação com Mercado Pago',
        error: fetchError instanceof Error ? fetchError.message : 'Erro desconhecido'
      })
    }

    // Se o pagamento foi aprovado, processar
    if (payment.status === 'approved') {
      console.log(`🎉 Pagamento aprovado: ${payment.id}`)

      // Primeiro, buscar repasse existente com este paymentId
      let repasse = await prisma.repasseParceiro.findFirst({
        where: {
          paymentId: String(payment.id),
          status: 'aguardando_pagamento'
        },
        include: {
          compra: {
            include: {
              parceiro: {
                include: {
                  usuario: true
                }
              },
              usuario: true
            }
          }
        }
      })

      if (repasse) {
        console.log(`⚙️ Processando repasse existente: ${repasse.id}`)
        
        try {
          // Calcular distribuição (50% para usuário, 25% sistema, 25% fundo)
          const valor = repasse.valor
          const pctUsuario = valor * 0.5 // 50% para jogador
          const pctSistema = valor * 0.25 // 25% para sistema
          const pctFundo = valor * 0.25 // 25% para fundo

          // Transação: processar tudo de uma vez
          await prisma.$transaction(async (tx) => {
            // 1. Atualizar status do repasse para pago
            await tx.repasseParceiro.update({
              where: { id: repasse.id },
              data: { 
                status: 'pago',
                dataRepasse: new Date()
              }
            })

            // 2. Atualizar status da compra para cashback_liberado
            await tx.compraParceiro.update({
              where: { id: repasse.compra.id },
              data: { status: 'cashback_liberado' }
            })

            // 3. Parceiro não recebe nada (já pagou o repasse)
            // Não precisa atualizar saldo devedor pois o repasse foi pago integralmente

            // 4. Creditar sementes para o usuário
            await tx.usuario.update({
              where: { id: repasse.compra.usuarioId },
              data: { sementes: { increment: pctUsuario } }
            })

            // 5. Criar registro de semente
            await tx.semente.create({
              data: {
                usuarioId: repasse.compra.usuarioId,
                quantidade: pctUsuario,
                tipo: 'resgatada',
                descricao: `Cashback compra parceiro ${repasse.compra.id} - Webhook MercadoPago`
              }
            })

            // 6. Atualizar fundo de distribuição ativo usando função utilitária
            try {
              const fundoAtualizado = await adicionarAoFundoAtivoTx(tx, pctFundo, 1)
              console.log(`💰 Fundo ${fundoAtualizado.id} atualizado: +R$ ${pctFundo} (Total: R$ ${fundoAtualizado.valorTotal})`)
            } catch (fundoError) {
              console.log(`⚠️ Erro ao atualizar fundo: ${fundoError instanceof Error ? fundoError.message : 'Erro desconhecido'}`)
            }
          })

          console.log(`✅ Repasse ${repasse.id} processado com sucesso via webhook!`)
          console.log(`💰 Usuário ${repasse.compra.usuario.nome} recebeu ${pctUsuario} sementes`)

          return res.status(200).json({ 
            success: true, 
            message: 'Repasse processado com sucesso',
            paymentId: String(payment.id),
            repasseProcessado: repasse.id,
            valorRepasse: valor,
            sementesCreditadas: pctUsuario
          })

        } catch (error) {
          console.error(`❌ Erro ao processar repasse ${repasse.id}:`, error)
          return res.status(500).json({ 
            error: 'Erro ao processar repasse',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
          })
        }
      }

      // Se não encontrou repasse, buscar compra (fluxo antigo)
      let compra = null
      
      // Primeiro, tentar buscar pela external_reference se existir
      if (payment.external_reference) {
        compra = await prisma.compraParceiro.findFirst({
          where: {
            id: payment.external_reference,
            status: 'aguardando_repasse'
          },
          include: {
            parceiro: {
              include: {
                usuario: true
              }
            },
            usuario: true
          }
        })
      }
      
      // Se não encontrou pela external_reference, buscar uma compra pendente
      if (!compra) {
        compra = await prisma.compraParceiro.findFirst({
          where: {
            status: 'aguardando_repasse'
          },
          include: {
            parceiro: {
              include: {
                usuario: true
              }
            },
            usuario: true
          },
          orderBy: {
            dataCompra: 'desc'
          }
        })
      }

      if (!compra) {
        console.log('⚠️ Nenhuma compra encontrada para processar')
        return res.status(200).json({ 
          success: true, 
          message: 'Pagamento aprovado - nenhuma compra pendente encontrada',
          paymentId: String(payment.id)
        })
      }

      console.log(`⚙️ Processando compra: ${compra.id}`)

      try {
        // Calcular valor do repasse (10% da compra)
        const valorRepasse = compra.valorCompra * 0.10
        const pctUsuario = valorRepasse * 0.50    // 50% para usuário (em sementes)
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

        } catch (error) {
          console.error('⚠️ Erro nas operações secundárias:', error)
        }

        return res.status(200).json({ 
          success: true, 
          message: 'Pagamento processado com sucesso',
          paymentId: String(payment.id),
          compraProcessada: compra.id,
          valorRepasse: valorRepasse
        })

               } catch (error) {
           console.error(`❌ Erro ao processar compra ${compra.id}:`, error)
           return res.status(500).json({ 
             error: 'Erro ao processar compra',
             details: error instanceof Error ? error.message : 'Erro desconhecido'
           })
         }

    } else {
      console.log('ℹ️ Pagamento não aprovado:', payment.status)
      return res.status(200).json({ 
        success: true, 
        message: 'Webhook recebido - pagamento não aprovado',
        status: payment.status,
        paymentId: String(payment.id)
      })
    }

  } catch (error) {
    console.error('❌ Erro no webhook:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}