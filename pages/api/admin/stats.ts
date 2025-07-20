import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Buscar estatísticas gerais
    const [
      totalUsuarios,
      totalCriadores,
      totalDoacoes,
      totalSementes,
      doacoesHoje,
      novosUsuariosHoje,
      cashbacksResgatados,
      missoesCompletadas
    ] = await Promise.all([
      // Total de usuários
      prisma.usuario.count(),
      
      // Total de criadores
      prisma.criador.count(),
      
      // Total de doações
      prisma.doacao.count(),
      
      // Total de sementes em circulação
      prisma.usuario.aggregate({
        _sum: {
          sementes: true
        }
      }),
      
      // Doações hoje
      prisma.doacao.count({
        where: {
          data: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Novos usuários hoje
      prisma.usuario.count({
        where: {
          dataCriacao: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Cashbacks resgatados
      prisma.transacao.count({
        where: {
          tipo: 'CASHBACK',
          status: 'aprovada'
        }
      }),
      
      // Missões completadas (mockado por enquanto)
      Promise.resolve(150)
    ])

    const stats = {
      totalUsuarios,
      totalCriadores,
      totalDoacoes,
      totalSementes: totalSementes._sum.sementes || 0,
      doacoesHoje,
      novosUsuariosHoje,
      cashbacksResgatados,
      missoesCompletadas
    }

    return res.status(200).json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas admin:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 