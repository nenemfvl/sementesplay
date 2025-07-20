import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Por enquanto, retornar dados mockados
    // Em produção, você criaria tabelas de conversas e mensagens
    const conversas = [
      {
        id: '1',
        usuarioId: '1',
        usuarioNome: 'João Silva',
        usuarioEmail: 'joao@email.com',
        ultimaMensagem: 'Oi! Como você está?',
        ultimaMensagemTimestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 min atrás
        naoLidas: 2,
        online: true
      },
      {
        id: '2',
        usuarioId: '2',
        usuarioNome: 'Maria Santos',
        usuarioEmail: 'maria@email.com',
        ultimaMensagem: 'Obrigada pela doação!',
        ultimaMensagemTimestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
        naoLidas: 0,
        online: false
      },
      {
        id: '3',
        usuarioId: '3',
        usuarioNome: 'Pedro Costa',
        usuarioEmail: 'pedro@email.com',
        ultimaMensagem: 'Vamos jogar juntos?',
        ultimaMensagemTimestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
        naoLidas: 1,
        online: true
      },
      {
        id: '4',
        usuarioId: '4',
        usuarioNome: 'Ana Oliveira',
        usuarioEmail: 'ana@email.com',
        ultimaMensagem: 'Parabéns pelo ranking!',
        ultimaMensagemTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
        naoLidas: 0,
        online: false
      },
      {
        id: '5',
        usuarioId: '5',
        usuarioNome: 'Carlos Lima',
        usuarioEmail: 'carlos@email.com',
        ultimaMensagem: 'Conseguiu completar a missão?',
        ultimaMensagemTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
        naoLidas: 0,
        online: false
      }
    ]

    return res.status(200).json({ conversas })
  } catch (error) {
    console.error('Erro ao buscar conversas:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 