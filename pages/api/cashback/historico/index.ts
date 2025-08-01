import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { usuarioId } = req.query

    if (!usuarioId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }

    // Buscar histórico de compras liberadas do usuário
    const compras = await prisma.compraParceiro.findMany({
      where: {
        usuarioId: String(usuarioId),
        status: 'cashback_liberado'
      },
      include: {
        parceiro: {
          select: {
            nomeCidade: true
          }
        },
        repasse: {
          select: {
            status: true,
            dataRepasse: true
          }
        }
      },
      orderBy: {
        dataCompra: 'desc'
      }
    })

    // Buscar histórico de códigos de cashback usados
    const codigosUsados = await prisma.codigoCashback.findMany({
      where: {
        usado: true
      },
      include: {
        parceiro: {
          select: {
            nomeCidade: true
          }
        }
      },
      orderBy: {
        dataUso: 'desc'
      }
    })

    // Formatar histórico de compras
    const historicoCompras = compras.map(compra => ({
      id: compra.id,
      codigo: compra.cupomUsado,
      valor: Math.round(compra.valorCompra * 0.05), // 5% para o usuário
      dataResgate: compra.dataCompra,
      status: compra.status === 'cashback_liberado' ? 'aprovado' : 
              compra.status === 'aguardando_repasse' ? 'pendente' : 'processado',
      observacao: `Compra de R$ ${compra.valorCompra.toFixed(2)} em ${compra.parceiro.nomeCidade}`,
      criadorNome: compra.parceiro.nomeCidade,
      tipo: 'compra'
    }))

    // Formatar histórico de códigos
    const historicoCodigos = codigosUsados.map(codigo => ({
      id: codigo.id,
      codigo: codigo.codigo,
      valor: Math.round(codigo.valor),
      dataResgate: codigo.dataUso!,
      status: 'aprovado' as const,
      observacao: `Código de cashback de ${codigo.parceiro.nomeCidade}`,
      criadorNome: codigo.parceiro.nomeCidade,
      tipo: 'codigo'
    }))

    // Combinar e ordenar por data
    const historico = [...historicoCompras, ...historicoCodigos]
      .sort((a, b) => new Date(b.dataResgate).getTime() - new Date(a.dataResgate).getTime())

    return res.status(200).json({ historico })
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 