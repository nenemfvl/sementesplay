import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { paymentId } = req.query

    if (!paymentId) {
      return res.status(400).json({ error: 'paymentId é obrigatório' })
    }

    console.log(`🔍 Buscando repasse com paymentId: ${paymentId}`)

    // Buscar repasse pelo paymentId
    const repasse = await prisma.repasseParceiro.findFirst({
      where: {
        paymentId: String(paymentId)
      },
      include: {
        parceiro: true,
        compra: true
      }
    })

    if (!repasse) {
      console.log(`❌ Repasse não encontrado para paymentId: ${paymentId}`)
      return res.status(404).json({ 
        error: 'Repasse não encontrado',
        paymentId: String(paymentId)
      })
    }

    console.log(`✅ Repasse encontrado:`, repasse)

    // Buscar todos os repasses para debug
    const todosRepasses = await prisma.repasseParceiro.findMany({
      select: {
        id: true,
        paymentId: true,
        status: true,
        valor: true,
        dataCriacao: true,
        dataRepasse: true
      },
      orderBy: {
        dataCriacao: 'desc'
      }
    })

    res.status(200).json({
      success: true,
      repasse: {
        id: repasse.id,
        paymentId: repasse.paymentId,
        status: repasse.status,
        valor: repasse.valor,
        dataCriacao: repasse.dataCriacao,
        dataRepasse: repasse.dataRepasse,
        parceiroId: repasse.parceiroId,
        compraId: repasse.compraId
      },
      todosRepasses,
      totalRepasses: todosRepasses.length
    })

  } catch (error) {
    console.error('❌ Erro ao buscar repasse:', error)
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}
