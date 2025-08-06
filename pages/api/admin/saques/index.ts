import { prisma } from '../../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Verificar se é admin (nivel 5)
      const user = await prisma.usuario.findFirst({
        where: { nivel: '5' }
      })

      if (!user) {
        return res.status(403).json({ error: 'Acesso negado - Admin não encontrado' })
      }

      // Buscar todos os saques com dados do usuário
      const saques = await prisma.saque.findMany({
        include: {
          usuario: {
            select: {
              nome: true,
              email: true
            }
          }
        },
        orderBy: {
          dataSolicitacao: 'desc'
        }
      })

      res.status(200).json({ saques })

    } catch (error) {
      console.error('Erro ao buscar saques:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({ error: 'Método não permitido' })
  }
} 