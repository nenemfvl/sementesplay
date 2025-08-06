import { prisma } from '../../../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const user = getUserFromToken(req)
  if (!user) {
    return res.status(401).json({ error: 'Usuário não autenticado' })
  }

  const { id } = req.query
  if (!id) {
    return res.status(400).json({ error: 'ID da solicitação é obrigatório' })
  }

  // Buscar a solicitação de amizade
  const solicitacao = await prisma.amizade.findUnique({
    where: { id: String(id) }
  })

  if (!solicitacao) {
    return res.status(404).json({ error: 'Solicitação não encontrada' })
  }

  // Só o destinatário pode aceitar
  if (solicitacao.amigoId !== user.id) {
    return res.status(403).json({ error: 'Acesso negado' })
  }

  // Atualizar status para 'aceita'
  await prisma.amizade.update({
    where: { id: String(id) },
    data: { status: 'aceita' }
  })

  return res.status(200).json({ message: 'Solicitação aceita com sucesso' })
} 