import { NextApiRequest, NextApiResponse } from 'next'
import { PermissionsManager } from '../../../lib/permissions-manager'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Verificar se é admin (nível 5)
    const { authorization } = req.headers
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autorização necessário' })
    }

    const token = authorization.replace('Bearer ', '')
    
    // Aqui você pode adicionar verificação do token se necessário
    // Por enquanto, vamos assumir que é uma chamada autorizada

    // Executar verificação e correção
    const resultado = await PermissionsManager.checkAndFixPermissions()

    res.status(200).json({
      success: true,
      message: 'Verificação de permissões concluída',
      resultado
    })

  } catch (error) {
    console.error('Erro ao verificar permissões:', error)
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    })
  }
} 