import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { id } = req.query

    // Por enquanto, simular resgate de código
    // Em produção, você verificaria se o código existe e pode ser usado
    const valor = Math.floor(Math.random() * 200) + 50 // 50-250 sementes

    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1000))

    return res.status(200).json({
      success: true,
      message: 'Código resgatado com sucesso!',
      valor
    })
  } catch (error) {
    console.error('Erro ao resgatar código:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 