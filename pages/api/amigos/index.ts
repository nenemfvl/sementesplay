import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Por enquanto, retornar dados mockados
    // Em produção, você criaria tabelas de amizades no banco
    const amigos = [
      {
        id: '1',
        nome: 'João Silva',
        email: 'joao@email.com',
        nivel: 'Parceiro',
        sementes: 2500,
        status: 'online' as const,
        ultimaAtividade: new Date(),
        mutual: true
      },
      {
        id: '2',
        nome: 'Maria Santos',
        email: 'maria@email.com',
        nivel: 'Criador',
        sementes: 5000,
        status: 'away' as const,
        ultimaAtividade: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
        mutual: true
      },
      {
        id: '3',
        nome: 'Pedro Costa',
        email: 'pedro@email.com',
        nivel: 'Iniciante',
        sementes: 800,
        status: 'offline' as const,
        ultimaAtividade: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
        mutual: false
      },
      {
        id: '4',
        nome: 'Ana Oliveira',
        email: 'ana@email.com',
        nivel: 'Parceiro',
        sementes: 3200,
        status: 'online' as const,
        ultimaAtividade: new Date(),
        mutual: true
      },
      {
        id: '5',
        nome: 'Carlos Lima',
        email: 'carlos@email.com',
        nivel: 'Criador',
        sementes: 7500,
        status: 'offline' as const,
        ultimaAtividade: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
        mutual: false
      }
    ]

    return res.status(200).json({ amigos })
  } catch (error) {
    console.error('Erro ao buscar amigos:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 