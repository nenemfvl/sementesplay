import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { repasseId } = req.body
    if (!repasseId) {
      return res.status(400).json({ error: 'ID do repasse obrigatório' })
    }

    // Busca o repasse
    const repasse = await prisma.repasseParceiro.findUnique({
      where: { id: repasseId },
      include: { 
        compra: {
          include: {
            parceiro: true
          }
        }
      }
    })

    if (!repasse) {
      return res.status(404).json({ error: 'Repasse não encontrado' })
    }

    if (repasse.status !== 'pendente') {
      return res.status(400).json({ error: 'Repasse já processado' })
    }

    // Atualizar status do repasse para rejeitado
    await prisma.repasseParceiro.update({
      where: { id: repasseId },
      data: { status: 'rejeitado' }
    })

    // Atualizar status da compra para rejeitada
    await prisma.compraParceiro.update({
      where: { id: repasse.compraId },
      data: { status: 'rejeitada' }
    })

    return res.status(200).json({ 
      success: true, 
      message: 'Repasse rejeitado com sucesso' 
    })

  } catch (error) {
    console.error('Erro ao rejeitar repasse:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 