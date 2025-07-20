import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        nivel: true,
        sementes: true,
        pontuacao: true,
        dataCriacao: true
      },
      orderBy: {
        dataCriacao: 'desc'
      }
    })

    // Adicionar status mockado (em uma implementação real, você teria uma tabela de status)
    const usuariosComStatus = usuarios.map(usuario => ({
      ...usuario,
      status: 'ativo' as const // Mockado por enquanto
    }))

    return res.status(200).json({ usuarios: usuariosComStatus })
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 