import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Buscar todos os usuários
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true,
        tipo: true,
        sementes: true,
        pontuacao: true
      },
      orderBy: {
        dataCriacao: 'desc'
      }
    })

    // Buscar todos os criadores existentes
    const criadores = await prisma.criador.findMany({
      select: {
        id: true,
        usuarioId: true,
        nome: true
      }
    })

    res.status(200).json({
      success: true,
      usuarios,
      criadores,
      totalUsuarios: usuarios.length,
      totalCriadores: criadores.length
    })

  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 