import { NextApiRequest, NextApiResponse } from 'next'
import { atualizarNiveisCriadores } from '../../../lib/niveis-criadores'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Permitir apenas POST e GET (para testes)
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Verificar se é uma chamada automática (com token secreto) ou manual
    const authHeader = req.headers.authorization
    const isAutomaticCall = authHeader === `Bearer ${process.env.INTERNAL_API_SECRET}`

    // Se não for chamada automática, verificar se é GET (para testes)
    if (!isAutomaticCall && req.method !== 'GET') {
      return res.status(401).json({ error: 'Não autorizado' })
    }

    console.log('🔄 Atualização automática de níveis iniciada...')

    const resultado = await atualizarNiveisCriadores()

    if (resultado.success) {
      console.log(`✅ Atualização concluída: ${resultado.atualizacoes.length} mudanças em ${resultado.totalCriadores} criadores`)
      
      res.status(200).json({
        success: true,
        message: resultado.message,
        mudancas: resultado.atualizacoes.length,
        totalCriadores: resultado.totalCriadores,
        timestamp: new Date().toISOString()
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
