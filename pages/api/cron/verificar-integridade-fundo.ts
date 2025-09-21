import { NextApiRequest, NextApiResponse } from 'next'
import { verificarIntegridadeFundo, buscarFundoAtivo, criarFundoAtivo } from '../../../lib/fundo-utils'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar autenticação do cron
  const cronSecret = process.env.CRON_SECRET_TOKEN
  const authHeader = req.headers.authorization

  // Permitir GET para Vercel cron jobs OU POST com Bearer token
  if (req.method === 'GET' || authHeader === `Bearer ${cronSecret}`) {
    // OK - continuar
  } else {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    console.log('🔍 [CRON] Verificando integridade do sistema de fundos...')
    
    const integridade = await verificarIntegridadeFundo()
    const fundoAtivo = await buscarFundoAtivo()
    
    let problemasEncontrados = []
    let acoesRealizadas = []

    // Verificar se existe fundo ativo
    if (!fundoAtivo) {
      console.log('⚠️ [CRON] CRÍTICO: Nenhum fundo ativo encontrado!')
      
      // Buscar última configuração de ciclo
      const configuracao = await prisma.configuracaoCiclos.findFirst({
        orderBy: { id: 'desc' }
      })
      
      const cicloAtual = configuracao?.numeroCiclo || 1
      
      // Criar novo fundo
      const novoFundo = await criarFundoAtivo(cicloAtual, 0)
      
      problemasEncontrados.push('Nenhum fundo ativo encontrado')
      acoesRealizadas.push(`Novo fundo criado: ${novoFundo.id} para ciclo ${cicloAtual}`)
      
      console.log(`✅ [CRON] Novo fundo criado: ${novoFundo.id}`)
    }

    // Verificar múltiplos fundos ativos
    if (integridade.fundosAtivos > 1) {
      console.log(`⚠️ [CRON] PROBLEMA: ${integridade.fundosAtivos} fundos ativos encontrados (deveria ser 1)`)
      problemasEncontrados.push(`${integridade.fundosAtivos} fundos ativos (deveria ser 1)`)
      
      // Notificar admin mas não corrigir automaticamente (pode ser intencional)
      await prisma.notificacao.create({
        data: {
          usuarioId: 'sistema',
          titulo: 'Múltiplos Fundos Ativos Detectados',
          mensagem: `Sistema encontrou ${integridade.fundosAtivos} fundos ativos. Verificar se é intencional ou corrigir manualmente.`,
          tipo: 'sistema',
          lida: false
        }
      }).catch(console.error)
    }

    // Verificar inconsistência de valores
    if (integridade.diferenca > 0.01) {
      console.log(`⚠️ [CRON] INCONSISTÊNCIA: Diferença de R$ ${integridade.diferenca.toFixed(2)} no valor do fundo`)
      problemasEncontrados.push(`Diferença de R$ ${integridade.diferenca.toFixed(2)} no valor do fundo`)
      
      // Notificar admin
      await prisma.notificacao.create({
        data: {
          usuarioId: 'sistema',
          titulo: 'Inconsistência no Fundo Detectada',
          mensagem: `Diferença de R$ ${integridade.diferenca.toFixed(2)} entre valor esperado (R$ ${integridade.valorEsperadoFundo.toFixed(2)}) e atual (R$ ${integridade.valorAtualFundo.toFixed(2)}) do fundo.`,
          tipo: 'sistema',
          lida: false
        }
      }).catch(console.error)
    }

    const relatorio = {
      timestamp: new Date().toISOString(),
      problemas: problemasEncontrados.length,
      problemasEncontrados,
      acoesRealizadas,
      integridade: {
        ...integridade,
        status: integridade.integridade && problemasEncontrados.length === 0 ? 'OK' : 'PROBLEMAS_DETECTADOS'
      }
    }

    console.log(`📊 [CRON] Verificação concluída: ${relatorio.integridade.status}`)
    
    if (problemasEncontrados.length === 0) {
      console.log('✅ [CRON] Sistema de fundos funcionando corretamente')
    } else {
      console.log(`⚠️ [CRON] ${problemasEncontrados.length} problema(s) detectado(s)`)
    }

    return res.status(200).json(relatorio)
    
  } catch (error) {
    console.error('❌ [CRON] Erro na verificação de integridade:', error)
    
    // Notificar erro crítico
    try {
      await prisma.notificacao.create({
        data: {
          usuarioId: 'sistema',
          titulo: 'Erro Crítico na Verificação de Integridade',
          mensagem: `Erro ao verificar integridade do fundo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          tipo: 'sistema',
          lida: false
        }
      })
    } catch (notifError) {
      console.error('❌ [CRON] Erro ao criar notificação:', notifError)
    }
    
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}
