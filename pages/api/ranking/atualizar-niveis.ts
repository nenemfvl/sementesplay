import { NextApiRequest, NextApiResponse } from 'next'
import { atualizarNiveisCriadores } from '../../../lib/niveis-criadores'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const resultado = await atualizarNiveisCriadores()

    if (resultado.success) {
      res.status(200).json({
        success: true,
        message: resultado.message,
        atualizacoes: resultado.atualizacoes.slice(0, 10), // Retornar apenas os primeiros 10
        totalCriadores: resultado.totalCriadores
      })
    } else {
      res.status(500).json({ 
        success: false,
        error: resultado.message 
      })
    }

  } catch (error) {
    console.error('Erro ao atualizar níveis:', error)
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    })
  }
} 