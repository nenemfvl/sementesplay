import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Por enquanto, retornar dados mockados
    // Em produção, seria baseado em algoritmos de recomendação
    const usuarios = [
      {
        id: '9',
        nome: 'Gabriela Silva',
        email: 'gabriela@email.com',
        nivel: 'Parceiro',
        sementes: 1800,
        status: 'online' as const,
        ultimaAtividade: new Date(),
        mutual: false
      },
      {
        id: '10',
        nome: 'Lucas Mendes',
        email: 'lucas@email.com',
        nivel: 'Criador',
        sementes: 4200,
        status: 'online' as const,
        ultimaAtividade: new Date(),
        mutual: false
      },
      {
        id: '11',
        nome: 'Juliana Santos',
        email: 'juliana@email.com',
        nivel: 'Iniciante',
        sementes: 650,
        status: 'away' as const,
        ultimaAtividade: new Date(Date.now() - 1000 * 60 * 45), // 45 min atrás
        mutual: false
      },
      {
        id: '12',
        nome: 'Rafael Costa',
        email: 'rafael@email.com',
        nivel: 'Parceiro',
        sementes: 2800,
        status: 'offline' as const,
        ultimaAtividade: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 horas atrás
        mutual: false
      },
      {
        id: '13',
        nome: 'Camila Oliveira',
        email: 'camila@email.com',
        nivel: 'Criador',
        sementes: 6100,
        status: 'online' as const,
        ultimaAtividade: new Date(),
        mutual: false
      },
      {
        id: '14',
        nome: 'Diego Almeida',
        email: 'diego@email.com',
        nivel: 'Iniciante',
        sementes: 950,
        status: 'online' as const,
        ultimaAtividade: new Date(),
        mutual: false
      }
    ]

    return res.status(200).json({ usuarios })
  } catch (error) {
    console.error('Erro ao buscar usuários sugeridos:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 