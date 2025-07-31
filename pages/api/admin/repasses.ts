import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Buscar todos os repasses com dados relacionados
    const repasses = await prisma.repasseParceiro.findMany({
      include: {
        parceiro: {
          include: {
            usuario: {
              select: {
                nome: true,
                email: true
              }
            }
          }
        },
          compra: {
    include: {
      usuario: {
        select: {
          nome: true,
          email: true
        }
      }
    }
  }
      },
      orderBy: {
        dataRepasse: 'desc'
      }
    })

    return res.status(200).json({ repasses })
  } catch (error) {
    console.error('Erro ao buscar repasses:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 