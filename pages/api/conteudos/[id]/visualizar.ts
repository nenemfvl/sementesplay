import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'ID do conteúdo não informado' })
  try {
    const conteudo = await prisma.conteudo.update({
      where: { id: String(id) },
      data: { visualizacoes: { increment: 1 } }
    })
    return res.status(200).json({ success: true, visualizacoes: conteudo.visualizacoes })
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao registrar visualização' })
  }
} 