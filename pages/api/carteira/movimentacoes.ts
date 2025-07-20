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

      // Buscar carteira
      const carteira = await prisma.carteiraDigital.findUnique({
        where: { usuarioId: String(usuarioId) }
      })

      if (!carteira) {
        return res.status(200).json({ movimentacoes: [] })
      }

      // Buscar movimentações
      const movimentacoes = await prisma.movimentacaoCarteira.findMany({
        where: { carteiraId: carteira.id },
        orderBy: { data: 'desc' },
        take: 50
      })

      res.status(200).json({
        movimentacoes: movimentacoes.map(mov => ({
          id: mov.id,
          tipo: mov.tipo,
          valor: mov.valor,
          descricao: mov.descricao,
          status: mov.status,
          data: mov.data
        }))
      })

    } catch (error) {
      console.error('Erro ao buscar movimentações:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({ error: 'Método não permitido' })
  }
} 