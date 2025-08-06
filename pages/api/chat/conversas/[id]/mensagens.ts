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
  if (req.method === 'GET') {
    const { id } = req.query
    if (!id) {
      return res.status(400).json({ error: 'ID da conversa é obrigatório' })
    }

    const mensagens = await prisma.mensagem.findMany({
      where: { conversaId: String(id) },
      include: {
        remetente: { select: { id: true, nome: true } }
      },
      orderBy: { dataEnvio: 'asc' }
    })

    const mensagensFormatadas = mensagens.map(mensagem => ({
      id: mensagem.id,
      remetenteId: mensagem.remetenteId,
      remetenteNome: mensagem.remetente.nome,
      conteudo: mensagem.texto,
      timestamp: mensagem.dataEnvio,
      lida: mensagem.lida
    }))

    return res.status(200).json({ mensagens: mensagensFormatadas })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const user = getUserFromToken(req)
  if (!user) {
    return res.status(401).json({ error: 'Usuário não autenticado' })
  }

  const { id } = req.query
  const { conteudo, tipo } = req.body

  if (!id || !conteudo) {
    return res.status(400).json({ error: 'ID da conversa e conteúdo são obrigatórios' })
  }

  const mensagem = await prisma.mensagem.create({
    data: {
      conversaId: String(id),
      remetenteId: user.id,
      texto: conteudo,
      dataEnvio: new Date()
    }
  })

  return res.status(201).json({ mensagem })
} 