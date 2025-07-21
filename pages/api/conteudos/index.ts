import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const conteudos = await prisma.conteudo.findMany()
      return res.status(200).json(conteudos)
    }
    if (req.method === 'POST') {
      const data = req.body
      const conteudo = await prisma.conteudo.create({ data })
      return res.status(201).json(conteudo)
    }
    if (req.method === 'PUT') {
      const { id, ...data } = req.body
      const conteudo = await prisma.conteudo.update({ where: { id }, data })
      return res.status(200).json(conteudo)
    }
    if (req.method === 'DELETE') {
      const { id } = req.body
      await prisma.conteudo.delete({ where: { id } })
      return res.status(204).end()
    }
    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error) {
    console.error('Erro no endpoint de Conteudo:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 