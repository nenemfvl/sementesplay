import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { categoria, periodo } = req.query

    // Por enquanto, retornar dados mockados
    const ranking = [
      {
        id: '1',
        nome: 'João Silva',
        avatar: '👨‍💻',
        nivel: 15,
        sementes: 15000,
        doacoes: 45,
        criadoresApoiados: 12,
        posicao: 1,
        categoria: 'doador' as const,
        periodo: 'total' as const,
        badge: 'Top Doador',
        icone: '🏆',
        cor: 'text-yellow-400'
      },
      {
        id: '2',
        nome: 'Maria Santos',
        avatar: '👩‍🎨',
        nivel: 12,
        sementes: 12500,
        doacoes: 38,
        criadoresApoiados: 8,
        posicao: 2,
        categoria: 'doador' as const,
        periodo: 'total' as const,
        badge: 'Generoso',
        icone: '💝',
        cor: 'text-blue-400'
      },
      {
        id: '3',
        nome: 'Pedro Costa',
        avatar: '👨‍🎤',
        nivel: 10,
        sementes: 9800,
        doacoes: 32,
        criadoresApoiados: 15,
        posicao: 3,
        categoria: 'doador' as const,
        periodo: 'total' as const,
        badge: 'Apoiador',
        icone: '🤝',
        cor: 'text-green-400'
      },
      {
        id: '4',
        nome: 'Ana Oliveira',
        avatar: '👩‍💼',
        nivel: 8,
        sementes: 8500,
        doacoes: 28,
        criadoresApoiados: 6,
        posicao: 4,
        categoria: 'doador' as const,
        periodo: 'total' as const,
        badge: 'Fiel',
        icone: '📅',
        cor: 'text-purple-400'
      },
      {
        id: '5',
        nome: 'Carlos Lima',
        avatar: '👨‍🔬',
        nivel: 7,
        sementes: 7200,
        doacoes: 25,
        criadoresApoiados: 9,
        posicao: 5,
        categoria: 'doador' as const,
        periodo: 'total' as const,
        badge: 'Novato',
        icone: '🌱',
        cor: 'text-gray-400'
      },
      {
        id: '6',
        nome: 'Lucia Ferreira',
        avatar: '👩‍🎭',
        nivel: 6,
        sementes: 6500,
        doacoes: 22,
        criadoresApoiados: 7,
        posicao: 6,
        categoria: 'doador' as const,
        periodo: 'total' as const,
        badge: 'Novato',
        icone: '🌱',
        cor: 'text-gray-400'
      },
      {
        id: '7',
        nome: 'Roberto Alves',
        avatar: '👨‍🏫',
        nivel: 5,
        sementes: 5800,
        doacoes: 19,
        criadoresApoiados: 5,
        posicao: 7,
        categoria: 'doador' as const,
        periodo: 'total' as const,
        badge: 'Novato',
        icone: '🌱',
        cor: 'text-gray-400'
      },
      {
        id: '8',
        nome: 'Fernanda Rocha',
        avatar: '👩‍⚕️',
        nivel: 4,
        sementes: 5200,
        doacoes: 17,
        criadoresApoiados: 4,
        posicao: 8,
        categoria: 'doador' as const,
        periodo: 'total' as const,
        badge: 'Novato',
        icone: '🌱',
        cor: 'text-gray-400'
      },
      {
        id: '9',
        nome: 'Marcelo Dias',
        avatar: '👨‍🚀',
        nivel: 3,
        sementes: 4800,
        doacoes: 15,
        criadoresApoiados: 3,
        posicao: 9,
        categoria: 'doador' as const,
        periodo: 'total' as const,
        badge: 'Novato',
        icone: '🌱',
        cor: 'text-gray-400'
      },
      {
        id: '10',
        nome: 'Juliana Moraes',
        avatar: '👩‍🎪',
        nivel: 2,
        sementes: 4200,
        doacoes: 12,
        criadoresApoiados: 2,
        posicao: 10,
        categoria: 'doador' as const,
        periodo: 'total' as const,
        badge: 'Novato',
        icone: '🌱',
        cor: 'text-gray-400'
      }
    ]

    // Filtrar por categoria se especificado
    let rankingFiltrado = ranking
    if (categoria && categoria !== 'doador') {
      // Em produção, você filtraria por categoria real
      rankingFiltrado = ranking.slice(0, 5) // Simular menos resultados para outras categorias
    }

    return res.status(200).json({ ranking: rankingFiltrado })
  } catch (error) {
    console.error('Erro ao buscar ranking:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 