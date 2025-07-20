import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Por enquanto, retornar dados mockados
    const solicitacoes = [
      {
        id: '1',
        remetenteId: '6',
        remetenteNome: 'Lucia Ferreira',
        remetenteEmail: 'lucia@email.com',
        dataEnvio: new Date(Date.now() - 1000 * 60 * 15), // 15 min atrás
        mensagem: 'Oi! Vamos ser amigos?'
      },
      {
        id: '2',
        remetenteId: '7',
        remetenteNome: 'Roberto Alves',
        remetenteEmail: 'roberto@email.com',
        dataEnvio: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
        mensagem: 'Gostei do seu perfil!'
      },
      {
        id: '3',
        remetenteId: '8',
        remetenteNome: 'Fernanda Costa',
        remetenteEmail: 'fernanda@email.com',
        dataEnvio: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 horas atrás
        mensagem: undefined
      }
    ]

    return res.status(200).json({ solicitacoes })
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 