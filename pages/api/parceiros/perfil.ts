import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Buscar o usuário logado (simulado - em produção seria via token/session)
    const { usuarioId } = req.query

    if (!usuarioId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }

    const parceiro = await prisma.parceiro.findUnique({
      where: {
        usuarioId: String(usuarioId)
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            nivel: true
          }
        }
      }
    })

    if (!parceiro) {
      return res.status(404).json({ error: 'Parceiro não encontrado' })
    }

    res.status(200).json(parceiro)
  } catch (error) {
    console.error('Erro ao buscar perfil do parceiro:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 