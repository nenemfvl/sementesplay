import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getUserFromToken } from '../utils/auth-backend'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const user = getUserFromToken(req)
  if (!user) {
    return res.status(401).json({ error: 'Usuário não autenticado' })
  }

  const { query } = req.query
  if (!query || typeof query !== 'string' || query.length < 2) {
    return res.status(400).json({ error: 'Query muito curta' })
  }

  const usuarios = await prisma.usuario.findMany({
    where: {
      OR: [
        { nome: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } }
      ],
      id: { not: user.id }
    },
    select: {
      id: true,
      nome: true,
      email: true,
      nivel: true,
      sementes: true
    },
    take: 20
  })

  return res.status(200).json({ usuarios })
} 