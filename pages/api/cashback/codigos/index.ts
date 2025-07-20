import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Por enquanto, retornar dados mockados
    const codigos = [
      {
        id: '1',
        codigo: 'WELCOME50',
        descricao: 'Código de boas-vindas - 50 Sementes',
        valor: 50,
        tipo: 'fixo' as const,
        valorMinimo: 0,
        valorMaximo: 50,
        dataInicio: new Date(),
        dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        status: 'ativo' as const,
        categoria: 'geral' as const,
        usos: 150,
        maxUsos: 1000,
        icone: '🎁',
        cor: 'green'
      },
      {
        id: '2',
        codigo: 'BONUS100',
        descricao: 'Bônus especial - 100 Sementes',
        valor: 100,
        tipo: 'fixo' as const,
        valorMinimo: 0,
        valorMaximo: 100,
        dataInicio: new Date(),
        dataFim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        status: 'ativo' as const,
        categoria: 'especial' as const,
        usos: 75,
        maxUsos: 200,
        icone: '⭐',
        cor: 'yellow'
      },
      {
        id: '3',
        codigo: 'EXTRA200',
        descricao: 'Extra cashback - 200 Sementes',
        valor: 200,
        tipo: 'fixo' as const,
        valorMinimo: 100,
        valorMaximo: 200,
        dataInicio: new Date(),
        dataFim: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
        status: 'ativo' as const,
        categoria: 'parceiro' as const,
        usos: 25,
        maxUsos: 100,
        icone: '💰',
        cor: 'blue'
      },
      {
        id: '4',
        codigo: 'GIFT500',
        descricao: 'Presente especial - 500 Sementes',
        valor: 500,
        tipo: 'fixo' as const,
        valorMinimo: 0,
        valorMaximo: 500,
        dataInicio: new Date(),
        dataFim: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 dia
        status: 'ativo' as const,
        categoria: 'especial' as const,
        usos: 10,
        maxUsos: 50,
        icone: '🎉',
        cor: 'purple'
      },
      {
        id: '5',
        codigo: 'CREATOR10',
        descricao: 'Código do criador João Silva - 10% de cashback',
        valor: 10,
        tipo: 'percentual' as const,
        valorMinimo: 50,
        valorMaximo: 1000,
        dataInicio: new Date(),
        dataFim: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
        status: 'ativo' as const,
        categoria: 'criador' as const,
        criadorId: '1',
        criadorNome: 'João Silva',
        usos: 45,
        maxUsos: 200,
        icone: '👨‍🎨',
        cor: 'pink'
      },
      {
        id: '6',
        codigo: 'MARIA15',
        descricao: 'Código da criadora Maria Santos - 15% de cashback',
        valor: 15,
        tipo: 'percentual' as const,
        valorMinimo: 100,
        valorMaximo: 2000,
        dataInicio: new Date(),
        dataFim: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 dias
        status: 'ativo' as const,
        categoria: 'criador' as const,
        criadorId: '2',
        criadorNome: 'Maria Santos',
        usos: 30,
        maxUsos: 150,
        icone: '👩‍🎨',
        cor: 'cyan'
      },
      {
        id: '7',
        codigo: 'EXPIRED100',
        descricao: 'Código expirado - 100 Sementes',
        valor: 100,
        tipo: 'fixo' as const,
        valorMinimo: 0,
        valorMaximo: 100,
        dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
        dataFim: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
        status: 'expirado' as const,
        categoria: 'geral' as const,
        usos: 200,
        maxUsos: 500,
        icone: '⏰',
        cor: 'red'
      },
      {
        id: '8',
        codigo: 'INACTIVE50',
        descricao: 'Código inativo - 50 Sementes',
        valor: 50,
        tipo: 'fixo' as const,
        valorMinimo: 0,
        valorMaximo: 50,
        dataInicio: new Date(),
        dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'inativo' as const,
        categoria: 'geral' as const,
        usos: 0,
        maxUsos: 100,
        icone: '🚫',
        cor: 'gray'
      }
    ]

    return res.status(200).json({ codigos })
  } catch (error) {
    console.error('Erro ao buscar códigos:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 