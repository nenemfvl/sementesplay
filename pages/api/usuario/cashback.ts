import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { usuarioId } = req.query
    if (!usuarioId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }

    // Compras feitas com o cupom sementesplay20
    const compras = await prisma.compraParceiro.findMany({
      where: {
        usuarioId: String(usuarioId),
        cupomUsado: 'sementesplay20'
      },
      orderBy: { dataCompra: 'desc' }
    })

    // Ganhos do fundo de sementes
    const ganhosFundo = await prisma.distribuicaoFundo.findMany({
      where: {
        usuarioId: String(usuarioId),
        tipo: 'usuario'
      },
      orderBy: { data: 'desc' }
    })

    return res.status(200).json({
      compras,
      ganhosFundo
    })
  } catch (error) {
    console.error('Erro ao buscar cashback do usuário:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 