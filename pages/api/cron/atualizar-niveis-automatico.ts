import { NextApiRequest, NextApiResponse } from 'next'
import { atualizarNiveisCriadores } from '../../../lib/niveis-criadores'

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
    console.log('🕛 Iniciando atualização automática de níveis...')
    console.log(`📅 Data/Hora: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`)

    const resultado = await atualizarNiveisCriadores()

    if (resultado.success) {
      console.log(`✅ Atualização automática concluída: ${resultado.atualizacoes.length} mudanças em ${resultado.totalCriadores} criadores`)
      
      // Log de auditoria para cron jobs
      console.log(`📊 Resumo da atualização automática:`)
      console.log(`- Total de criadores processados: ${resultado.totalCriadores}`)
      console.log(`- Níveis atualizados: ${resultado.atualizacoes.length}`)
      console.log(`- Timestamp: ${new Date().toISOString()}`)

      res.status(200).json({
        success: true,
        message: resultado.message,
        mudancas: resultado.atualizacoes.length,
        totalCriadores: resultado.totalCriadores,
        timestamp: new Date().toISOString(),
        timezone: 'America/Sao_Paulo'
      })
    } else {
      console.error('❌ Erro na atualização automática:', resultado.message)
      
      res.status(500).json({ 
        success: false,
        error: resultado.message,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('❌ Erro na atualização automática de níveis:', error)
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    })
  }
}
