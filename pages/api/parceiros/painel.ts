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

    // Busca o parceiro
    const parceiro = await prisma.parceiro.findUnique({
      where: { usuarioId: String(usuarioId) },
      include: {
        comprasParceiro: true,
        repasses: true
      }
    })
    if (!parceiro) {
      return res.status(404).json({ error: 'Parceiro não encontrado' })
    }

    return res.status(200).json({
      saldoDevedor: parceiro.saldoDevedor,
      compras: parceiro.comprasParceiro,
      repasses: parceiro.repasses
    })
  } catch (error) {
    console.error('Erro ao buscar painel do parceiro:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 