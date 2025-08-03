import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { id } = req.query
      const { ativa } = req.body

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'ID da missão é obrigatório' })
      }

      // Atualizar o status da missão
      const missaoAtualizada = await prisma.missao.update({
        where: { id },
        data: { ativa }
      })

      return res.status(200).json({ 
        success: true, 
        missao: missaoAtualizada 
      })
    } catch (error) {
      console.error('Erro ao alterar status da missão:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 