import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { usuarioId } = req.query

    if (!usuarioId || typeof usuarioId !== 'string') {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }

    // Buscar candidatura mais recente do usuário
    const candidatura = await prisma.candidaturaCriador.findFirst({
      where: {
        usuarioId: usuarioId
      },
      orderBy: {
        dataCandidatura: 'desc'
      },
      select: {
        id: true,
        status: true,
        dataCandidatura: true,
        observacoes: true
      }
    })

    if (!candidatura) {
      return res.status(200).json({ candidatura: null })
    }

    return res.status(200).json({ candidatura })
  } catch (error) {
    console.error('Erro ao verificar status da candidatura:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  } finally {
    await prisma.$disconnect()
  }
} 