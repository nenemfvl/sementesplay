import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar se é uma chamada de cron job (com token secreto)
  const authHeader = req.headers.authorization
  const cronSecret = process.env.CRON_SECRET || 'sementesplay-cron-2024'
  const isCronCall = authHeader === `Bearer ${cronSecret}`

  // Permitir apenas POST com autenticação ou GET para testes
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  // Se não for chamada de cron e não for GET, verificar autenticação
  if (!isCronCall && req.method !== 'GET') {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  try {
    console.log('🕛 Iniciando verificação automática de pagamentos pendentes...')
    console.log(`📅 Data/Hora: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`)

    // Configurar access token do Mercado Pago
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    
    if (!accessToken) {
      console.error('❌ MERCADOPAGO_ACCESS_TOKEN não configurado')
      return res.status(500).json({ 
        success: false,
        error: 'Configuração de pagamento não disponível'
      })
    }

    // Buscar repasses pendentes no banco (mais flexível)
    const repassesPendentes = await prisma.repasseParceiro.findMany({
      where: {
        OR: [
          { status: 'aguardando_pagamento' },
          { status: 'pendente' },
          { status: 'processando' }
        ],
        paymentId: {
          not: null
        }
      },
      include: {
        parceiro: true,
        compra: true
      }
    })

    console.log(`📊 Repasses pendentes encontrados: ${repassesPendentes.length}`)

    let pagamentosProcessados = 0
    let erros = 0

    // Verificar cada pagamento pendente
    for (const repasse of repassesPendentes) {
      try {
        if (!repasse.paymentId) continue

        console.log(`🔍 Verificando pagamento: ${repasse.paymentId}`)

        // Verificar status no Mercado Pago
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${repasse.paymentId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          console.error(`❌ Erro ao verificar pagamento ${repasse.paymentId}:`, response.status)
          erros++
          continue
        }

        const payment = await response.json()
        console.log(`📊 Status do pagamento ${repasse.paymentId}: ${payment.status}`)

        // Se pagamento foi aprovado, processar
        if (payment.status === 'approved') {
          console.log(`✅ Pagamento aprovado: ${repasse.paymentId}`)

          // PROCESSAR FLUXO COMPLETO DO REPASSE
          
          // 1. Atualizar status do repasse para 'pago'
          await prisma.repasseParceiro.update({
            where: { id: repasse.id },
            data: { 
              status: 'pago',
              dataRepasse: new Date()
            }
          })

          // 2. Se houver compra associada, atualizar status
          if (repasse.compra) {
            await prisma.compraParceiro.update({
              where: { id: repasse.compra.id },
              data: { status: 'cashback_liberado' }
            })

            // 3. Creditar sementes para o usuário (50% do repasse)
            const valorRepasse = repasse.valor
            const pctUsuario = valorRepasse * 0.50

            await prisma.usuario.update({
              where: { id: repasse.compra.usuarioId },
              data: { sementes: { increment: pctUsuario } }
            })

            console.log(`💰 Sementes creditadas para usuário: ${pctUsuario}`)
          }

          // 4. O REPASSE JÁ APARECE NAS TRANSAÇÕES RECENTES AUTOMATICAMENTE
          // A API /api/parceiros/transacoes já inclui repasses com status 'pago'
          // Não precisamos criar tabela adicional - o sistema já está configurado!

          console.log(`📊 Repasse processado e aparecerá automaticamente nas Transações Recentes: ${repasse.id}`)

          pagamentosProcessados++
          console.log(`✅ Repasse processado com sucesso e movido para Transações Recentes: ${repasse.id}`)
        }

      } catch (error) {
        console.error(`❌ Erro ao processar repasse ${repasse.id}:`, error)
        erros++
      }
    }

    console.log(`🎉 Verificação automática concluída:`)
    console.log(`- Pagamentos processados: ${pagamentosProcessados}`)
    console.log(`- Erros encontrados: ${erros}`)
    console.log(`- Total de repasses verificados: ${repassesPendentes.length}`)

    res.status(200).json({
      success: true,
      message: 'Verificação automática de pagamentos concluída',
      pagamentosProcessados,
      erros,
      totalVerificados: repassesPendentes.length,
      timestamp: new Date().toISOString(),
      timezone: 'America/Sao_Paulo'
    })

  } catch (error) {
    console.error('❌ Erro na verificação automática de pagamentos:', error)
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    })
  }
}
