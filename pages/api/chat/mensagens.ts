import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Por enquanto, retornar mensagens mockadas
    // Em uma implementação real, você criaria uma tabela mensagens_chat
    const mensagens = [
      {
        id: '1',
        remetenteId: 'sistema',
        remetenteNome: 'Sistema',
        conteudo: 'Bem-vindo ao chat da comunidade SementesPLAY! 🌱',
        timestamp: new Date(Date.now() - 3600000), // 1 hora atrás
        tipo: 'sistema'
      },
      {
        id: '2',
        remetenteId: 'sistema',
        remetenteNome: 'Sistema',
        conteudo: 'Use este espaço para conversar com outros membros!',
        timestamp: new Date(Date.now() - 1800000), // 30 min atrás
        tipo: 'sistema'
      }
    ]

    return res.status(200).json({ mensagens })
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 