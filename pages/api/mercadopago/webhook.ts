import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { enviarNotificacao } from '../../../lib/notificacao'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { data } = req.body

    if (data && data.id) {
      console.log('Webhook recebido do MercadoPago:', data.id)
      
      // Configurar access token
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
      
      if (!accessToken) {
        console.error('MERCADOPAGO_ACCESS_TOKEN não configurado')
        return res.status(500).json({ error: 'Configuração não disponível' })
      }
      
      // Buscar detalhes do pagamento via API direta
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
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
        // Pagamento aprovado - processar repasse automaticamente
        const repasseId = payment.external_reference
        
        if (!repasseId) {
          console.error('External reference não encontrada no pagamento')
          return res.status(400).json({ error: 'Referência externa não encontrada' })
        }

        console.log(`Processando repasse automaticamente: ${repasseId}`)

        try {
          // Buscar o repasse
          const repasse = await prisma.repasseParceiro.findUnique({
            where: { id: repasseId },
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

          if (!repasse) {
            console.error('Repasse não encontrado:', repasseId)
            return res.status(404).json({ error: 'Repasse não encontrado' })
          }

          if (repasse.status !== 'aguardando_pagamento') {
            console.log('Repasse já processado:', repasse.status)
            return res.status(200).json({ message: 'Repasse já processado' })
          }

          // Verificar se o paymentId corresponde
          if (repasse.paymentId !== payment.id.toString()) {
            console.error('PaymentId não corresponde:', repasse.paymentId, payment.id)
            return res.status(400).json({ error: 'PaymentId não corresponde' })
          }

          const compra = repasse.compra
          const parceiro = repasse.compra.parceiro
          const usuario = repasse.compra.usuario

          if (!compra || !parceiro || !usuario) {
            console.error('Dados inconsistentes no repasse')
            return res.status(400).json({ error: 'Dados inconsistentes' })
          }

          // Calcula as porcentagens
          const valor = repasse.valor
          const pctUsuario = valor * 0.50    // 50% para jogador (em sementes)
          const pctSistema = valor * 0.25               // 25% para sistema SementesPLAY
          const pctFundo = valor * 0.25                 // 25% para fundo de distribuição

          // Transação: atualiza tudo de uma vez
          await prisma.$transaction(async (tx) => {
            // Atualiza repasse para confirmado
            await tx.repasseParceiro.update({
              where: { id: repasseId },
              data: { 
                status: 'confirmado',
                dataRepasse: new Date()
              }
            })

            // Atualiza compra para cashback_liberado
            await tx.compraParceiro.update({
              where: { id: compra.id },
              data: { status: 'cashback_liberado' }
            })

            // Atualiza saldo devedor do parceiro
            await tx.parceiro.update({
              where: { id: parceiro.id },
              data: { saldoDevedor: { decrement: valor } }
            })

            // Credita sementes para usuário
            await tx.usuario.update({
              where: { id: compra.usuarioId },
              data: { sementes: { increment: pctUsuario } }
            })
            
            // Registra fundo de sementes
            const fundoExistente = await tx.fundoSementes.findFirst({
              where: { distribuido: false }
            })

            if (fundoExistente) {
              await tx.fundoSementes.update({
                where: { id: fundoExistente.id },
                data: { valorTotal: { increment: pctFundo } }
              })
            } else {
              await tx.fundoSementes.create({
                data: {
                  ciclo: 1,
                  valorTotal: pctFundo,
                  dataInicio: new Date(),
                  dataFim: new Date(),
                  distribuido: false
                }
              })
            }

            // Registra histórico de sementes para o jogador
            await tx.semente.create({
              data: {
                usuarioId: compra.usuarioId,
                quantidade: pctUsuario,
                tipo: 'resgatada',
                descricao: `Cashback compra parceiro ${compra.id} - Repasse ${repasseId}`
              }
            })

            // Registra movimentação na carteira do usuário
            const carteira = await tx.carteiraDigital.findUnique({
              where: { usuarioId: compra.usuarioId }
            })
            
            if (carteira) {
              await tx.movimentacaoCarteira.create({
                data: {
                  carteiraId: carteira.id,
                  tipo: 'credito',
                  valor: pctUsuario,
                  saldoAnterior: carteira.saldo,
                  saldoPosterior: carteira.saldo + pctUsuario,
                  descricao: `Cashback liberado - Compra parceiro ${compra.id}`,
                  referencia: repasseId
                }
              })
              
              // Atualiza saldo da carteira
              await tx.carteiraDigital.update({
                where: { id: carteira.id },
                data: { saldo: { increment: pctUsuario } }
              })
            }

            // Registra log do sistema
            await tx.logAuditoria.create({
              data: {
                usuarioId: parceiro.usuarioId,
                acao: 'REPASSE_CONFIRMADO_WEBHOOK',
                detalhes: JSON.stringify({
                  repasseId,
                  compraId: compra.id,
                  parceiroId: parceiro.id,
                  usuarioId: usuario.id,
                  valor,
                  pctUsuario,
                  pctSistema,
                  pctFundo,
                  paymentId: payment.id
                }),
                ip: Array.isArray(req.headers['x-forwarded-for']) ? req.headers['x-forwarded-for'][0] : req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
              }
            })
          })

          // Notificações fora da transação
          await enviarNotificacao(
            compra.usuarioId, 
            'cashback', 
            'Cashback liberado!', 
            `Seu cashback da compra foi liberado e você recebeu ${pctUsuario} sementes.`
          )

          await enviarNotificacao(
            parceiro.usuarioId,
            'repasse',
            'Repasse confirmado!',
            `Seu repasse de R$ ${valor.toFixed(2)} foi confirmado e processado automaticamente.`
          )

          console.log('Repasse processado com sucesso via webhook:', repasseId)

          return res.status(200).json({ 
            success: true, 
            message: 'Pagamento processado com sucesso',
            repasseId,
            paymentId: payment.id
          })
        } catch (error) {
          console.error('Erro ao processar repasse via webhook:', error)
          return res.status(500).json({ error: 'Erro ao processar repasse' })
        }
      } else {
        console.log('Pagamento não aprovado:', payment.status)
        return res.status(200).json({ 
          success: true, 
          message: 'Webhook recebido - pagamento não aprovado',
          status: payment.status
        })
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Webhook recebido' 
    })

  } catch (error) {
    console.error('Erro no webhook:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 