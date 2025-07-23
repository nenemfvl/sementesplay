import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { usuarioId } = req.query

    if (!usuarioId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }

    // Buscar o parceiro
    const parceiro = await prisma.parceiro.findUnique({
      where: {
        usuarioId: String(usuarioId)
      }
    })

    if (!parceiro) {
      return res.status(404).json({ error: 'Parceiro não encontrado' })
    }

    // Buscar códigos do parceiro
    const codigos = await prisma.codigoCashback.findMany({
      where: {
        parceiroId: parceiro.id
      },
      orderBy: {
        dataGeracao: 'desc'
      }
    })

    res.status(200).json(codigos)
  } catch (error) {
    console.error('Erro ao buscar códigos do parceiro:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 