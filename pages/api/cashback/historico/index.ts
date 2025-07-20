import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Por enquanto, retornar dados mockados
    const historico = [
      {
        id: '1',
        codigo: 'WELCOME50',
        valor: 50,
        dataResgate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
        status: 'aprovado' as const,
        observacao: 'Resgate aprovado automaticamente',
        criadorNome: undefined
      },
      {
        id: '2',
        codigo: 'BONUS100',
        valor: 100,
        dataResgate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
        status: 'processado' as const,
        observacao: 'Processado com sucesso',
        criadorNome: undefined
      },
      {
        id: '3',
        codigo: 'CREATOR10',
        valor: 75,
        dataResgate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
        status: 'aprovado' as const,
        observacao: 'Cashback do criador João Silva',
        criadorNome: 'João Silva'
      },
      {
        id: '4',
        codigo: 'EXTRA200',
        valor: 200,
        dataResgate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 dias atrás
        status: 'aprovado' as const,
        observacao: 'Código parceiro resgatado',
        criadorNome: undefined
      },
      {
        id: '5',
        codigo: 'MARIA15',
        valor: 150,
        dataResgate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 dias atrás
        status: 'pendente' as const,
        observacao: 'Aguardando aprovação',
        criadorNome: 'Maria Santos'
      },
      {
        id: '6',
        codigo: 'GIFT500',
        valor: 500,
        dataResgate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 dias atrás
        status: 'rejeitado' as const,
        observacao: 'Código já foi usado',
        criadorNome: undefined
      },
      {
        id: '7',
        codigo: 'WELCOME50',
        valor: 50,
        dataResgate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 dias atrás
        status: 'aprovado' as const,
        observacao: 'Primeiro resgate do usuário',
        criadorNome: undefined
      },
      {
        id: '8',
        codigo: 'BONUS100',
        valor: 100,
        dataResgate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 dias atrás
        status: 'processado' as const,
        observacao: 'Resgate processado',
        criadorNome: undefined
      }
    ]

    return res.status(200).json({ historico })
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 