import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { id } = req.query

    // Por enquanto, simular completar missão
    // Em produção, você verificaria se a missão pode ser completada
    const recompensa = {
      sementes: Math.floor(Math.random() * 200) + 100, // 100-300 sementes
      experiencia: Math.floor(Math.random() * 100) + 50, // 50-150 XP
      badge: Math.random() > 0.7 ? 'Novo Badge!' : undefined // 30% chance de badge
    }

    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1000))

    return res.status(200).json({
      success: true,
      message: 'Missão completada com sucesso!',
      recompensa
    })
  } catch (error) {
    console.error('Erro ao completar missão:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 