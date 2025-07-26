import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getUserFromToken } from '../utils/auth-backend'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const user = getUserFromToken(req)
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    // Verificar se o usuário é um criador
    const usuario = await prisma.usuario.findUnique({
      where: { id: user.id },
      include: {
        criador: true
      }
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    if (!usuario.criador) {
      return res.status(403).json({ error: 'Acesso negado. Apenas criadores podem acessar este recurso.' })
    }

    res.status(200).json({ 
      success: true, 
      isCriador: true,
      criador: usuario.criador 
    })

  } catch (error) {
    console.error('Erro ao verificar acesso de criador:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 