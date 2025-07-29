import { NextApiRequest, NextApiResponse } from 'next'
import { PermissionsManager } from '../../../lib/permissions-manager'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { usuarioId } = req.query

    if (!usuarioId || typeof usuarioId !== 'string') {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }

    // Verificar permissões do usuário
    const resultado = await PermissionsManager.checkUserPermissions(usuarioId)

    if (resultado.error) {
      return res.status(404).json({ error: resultado.error })
    }

    res.status(200).json({
      success: true,
      resultado
    })

  } catch (error) {
    console.error('Erro ao verificar permissões do usuário:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    })
  }
} 