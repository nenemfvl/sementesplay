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

    // Buscar o parceiro
    const parceiro = await prisma.parceiro.findUnique({
      where: { usuarioId: String(usuarioId) }
    })

    if (!parceiro) {
      return res.status(404).json({ error: 'Parceiro não encontrado' })
    }

    // Buscar compras aguardando repasse
    const comprasAguardandoRepasse = await prisma.compraParceiro.findMany({
      where: {
        parceiroId: parceiro.id,
        status: {
          in: ['aguardando_repasse', 'repasse_pendente']
        }
      },
      include: {
        usuario: {
          select: {
            nome: true,
            email: true
          }
        }
      },
      orderBy: {
        dataCompra: 'desc'
      }
    })

    // Buscar repasses pendentes
    const repassesPendentes = await prisma.repasseParceiro.findMany({
      where: {
        parceiroId: parceiro.id,
        status: 'pendente'
      },
      include: {
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

    // Formatar dados para o frontend
    const repassesFormatados = [
      // Compras aguardando repasse
      ...comprasAguardandoRepasse.map(compra => ({
        id: compra.id,
        valorCompra: compra.valorCompra,
        valorRepasse: compra.valorCompra * 0.10, // 10% da compra
        status: 'aguardando_repasse',
        dataCompra: compra.dataCompra,
        dataRepasse: null,
        comprovante: null,
        usuario: compra.usuario,
        tipo: 'compra'
      })),
      // Repasses pendentes
      ...repassesPendentes.map(repasse => ({
        id: repasse.id,
        valorCompra: repasse.compra.valorCompra,
        valorRepasse: repasse.valor,
        status: 'repasse_pendente',
        dataCompra: repasse.compra.dataCompra,
        dataRepasse: repasse.dataRepasse,
        comprovante: repasse.comprovanteUrl,
        usuario: repasse.compra.usuario,
        tipo: 'repasse'
      }))
    ]

    return res.status(200).json(repassesFormatados)
  } catch (error) {
    console.error('Erro ao buscar repasses pendentes:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 