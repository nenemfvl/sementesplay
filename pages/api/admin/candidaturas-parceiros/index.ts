import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const user = await prisma.usuario.findFirst({
        where: { nivel: '5' }
      })

      if (!user) {
        return res.status(403).json({ error: 'Acesso negado - Admin não encontrado' })
      }

      const candidaturas = await prisma.candidaturaParceiro.findMany({
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          }
        },
        orderBy: {
          dataCandidatura: 'desc'
        }
      })

      res.status(200).json({ candidaturas })
    } catch (error) {
      console.error('Erro ao listar candidaturas:', error)
      res.status(500).json({ error: 'Erro interno do servidor ao listar candidaturas' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 