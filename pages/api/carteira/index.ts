import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { auth } from '../../../lib/auth'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Verificar autenticação
      const user = auth.getUser()
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      const { usuarioId } = req.query

      if (!usuarioId || usuarioId !== user.id) {
        return res.status(403).json({ error: 'Acesso negado' })
      }

      // Buscar ou criar carteira
      let carteira = await prisma.carteiraDigital.findUnique({
        where: { usuarioId: String(usuarioId) }
      })

      if (!carteira) {
        carteira = await prisma.carteiraDigital.create({
          data: {
            usuarioId: String(usuarioId),
            saldo: 0,
            saldoPendente: 0,
            totalRecebido: 0,
            totalSacado: 0
          }
        })
      }

      res.status(200).json({
        saldo: carteira.saldo,
        saldoPendente: carteira.saldoPendente,
        totalRecebido: carteira.totalRecebido,
        totalSacado: carteira.totalSacado
      })

    } catch (error) {
      console.error('Erro ao buscar carteira:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({ error: 'Método não permitido' })
  }
} 