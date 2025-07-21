import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const comentarios = await prisma.comentario.findMany()
      return res.status(200).json(comentarios)
    }
    if (req.method === 'POST') {
      const data = req.body
      const comentario = await prisma.comentario.create({ data })
      return res.status(201).json(comentario)
    }
    if (req.method === 'PUT') {
      const { id, ...data } = req.body
      const comentario = await prisma.comentario.update({ where: { id }, data })
      return res.status(200).json(comentario)
    }
    if (req.method === 'DELETE') {
      const { id } = req.body
      await prisma.comentario.delete({ where: { id } })
      return res.status(204).end()
    }
    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error) {
    console.error('Erro no endpoint de Comentario:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 