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

    // Buscar dados completos do usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: user.id },
      include: {
        criador: true
      }
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    return res.status(200).json({
      success: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        nivel: usuario.nivel,
        criador: usuario.criador
      }
    })

  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 