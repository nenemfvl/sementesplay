import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

const getUserFromToken = (req: NextApiRequest) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return null
  const token = authHeader.split(' ')[1]
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'sementesplay_secret') as { id: string }
  } catch {
    return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const user = getUserFromToken(req)
  if (!user) {
    return res.status(401).json({ error: 'Usuário não autenticado' })
  }

  const { id } = req.query
  if (!id) {
    return res.status(400).json({ error: 'ID do amigo é obrigatório' })
  }

  // Buscar a amizade (pode ser em qualquer direção)
  const amizade = await prisma.amizade.findFirst({
    where: {
      OR: [
        { usuarioId: user.id, amigoId: String(id), status: 'aceita' },
        { usuarioId: String(id), amigoId: user.id, status: 'aceita' }
      ]
    }
  })

  if (!amizade) {
    return res.status(404).json({ error: 'Amizade não encontrada' })
  }

  // Remover a amizade
  await prisma.amizade.delete({
    where: { id: amizade.id }
  })

  return res.status(200).json({ message: 'Amizade removida com sucesso' })
} 