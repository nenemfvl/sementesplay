import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' })
    }

    const userId = authHeader.replace('Bearer ', '')

    // Verificar se o usuário é um criador
    const criador = await prisma.criador.findUnique({
      where: { usuarioId: userId }
    })

    if (!criador) {
      return res.status(403).json({ error: 'Usuário não é um criador' })
    }

    // Buscar estatísticas
    const [totalDoacoes, totalSementes, totalFavoritos] = await Promise.all([
      // Total de doações recebidas
      prisma.doacao.count({
        where: { criadorId: criador.id }
      }),
      
      // Total de sementes recebidas
      prisma.doacao.aggregate({
        where: { criadorId: criador.id },
        _sum: { quantidade: true }
      }),
      
      // Total de favoritos (simulado - você pode implementar uma tabela de favoritos)
      Promise.resolve(0) // Por enquanto retorna 0, pode ser implementado depois
    ])

    const estatisticas = {
      totalDoacoes,
      totalSementes: totalSementes._sum.quantidade || 0,
      totalFavoritos
    }

    return res.status(200).json(estatisticas)
  } catch (error) {
    console.error('Erro ao buscar estatísticas do criador:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 