import { prisma } from '../../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Buscar estatísticas reais
    const [
      totalDoadores,
      totalCriadores,
      sementesDistribuidas,
      doacoesRealizadas,
      rankingAtualizado
    ] = await Promise.all([
      // Total de doadores únicos
      prisma.doacao.groupBy({
        by: ['doadorId'],
        _count: { doadorId: true }
      }).then(result => result.length),

      // Total de criadores únicos
      prisma.doacao.groupBy({
        by: ['criadorId'],
        _count: { criadorId: true }
      }).then(result => result.length),

      // Total de sementes distribuídas
      prisma.doacao.aggregate({
        _sum: { quantidade: true }
      }).then(result => result._sum.quantidade || 0),

      // Total de doações realizadas
      prisma.doacao.count(),

      // Data da última atualização (última doação)
      prisma.doacao.findFirst({
        orderBy: { data: 'desc' },
        select: { data: true }
      }).then(result => result?.data || new Date())
    ])

    const estatisticas = {
      totalDoadores,
      totalCriadores,
      sementesDistribuidas,
      doacoesRealizadas,
      rankingAtualizado
    }

    return res.status(200).json(estatisticas)
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 