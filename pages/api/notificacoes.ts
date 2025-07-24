import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { usuarioId } = req.query
    if (!usuarioId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }

    const notificacoes = await prisma.notificacao.findMany({
      where: { usuarioId: String(usuarioId) },
      orderBy: { data: 'desc' }
    })

    return res.status(200).json({ notificacoes })
  } catch (error) {
    console.error('Erro ao buscar notificações:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 