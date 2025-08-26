import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { paymentId } = req.body

    if (!paymentId) {
      return res.status(400).json({ error: 'paymentId é obrigatório' })
    }

    console.log(`🔍 Processando pagamento manualmente: ${paymentId}`)

    // Configurar access token
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    
    if (!accessToken) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN não configurado')
      return res.status(500).json({ error: 'Configuração não disponível' })
    }
    
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
      console.log(`🎉 Pagamento aprovado: ${payment.id}`)

      // Buscar a compra específica que corresponde a este pagamento
      const compra = await prisma.compraParceiro.findFirst({
        where: {
          status: 'aguardando_repasse'
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
              descricao: `Cashback compra parceiro ${compra.id} - Processamento Manual`
            }
          })
        })

        // Atualizar fundo de sementes
        try {
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
              mensagem: `Seu cashback de R$ ${valorRepasse.toFixed(2)} foi liberado! Você recebeu ${pctUsuario} sementes.`,
              tipo: 'cashback',
              lida: false
            }
          })

          console.log('🎯 Repasse processado com sucesso manualmente:', compra.id)

          return res.status(200).json({ 
            success: true, 
            message: 'Pagamento processado com sucesso',
            compraId: compra.id,
            paymentId: String(payment.id),
            sementesCreditadas: pctUsuario
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
        return res.status(404).json({ 
          error: 'Nenhuma compra pendente encontrada',
          paymentId: String(payment.id)
        })
      }
    } else {
      console.log('ℹ️ Pagamento não aprovado:', payment.status)
      return res.status(400).json({ 
        error: 'Pagamento não aprovado',
        status: payment.status,
        paymentId: String(payment.id)
      })
    }

  } catch (error) {
    console.error('❌ Erro ao processar pagamento:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}
