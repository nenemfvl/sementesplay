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

    // Buscar o parceiro
    const parceiro = await prisma.parceiro.findUnique({
      where: {
        usuarioId: String(usuarioId)
      }
    })

    if (!parceiro) {
      return res.status(404).json({ error: 'Parceiro não encontrado' })
    }

    // Buscar códigos do parceiro
    const codigosParceiro = await prisma.codigoCashback.findMany({
      where: {
        parceiroId: parceiro.id
      },
      select: {
        codigo: true,
        usado: true
      }
    })

    const codigos = codigosParceiro.map(c => c.codigo)

    // Buscar transações que usaram códigos deste parceiro
    const transacoes = await prisma.transacao.findMany({
      where: {
        codigoParceiro: {
          in: codigos
        },
        status: 'aprovada'
      }
    })

    // Calcular estatísticas
    const totalVendas = transacoes.reduce((sum, t) => sum + t.valor, 0)
    const totalComissoes = totalVendas * 0.1 // 10% de comissão
    const codigosAtivos = codigosParceiro.filter(c => !c.usado).length
    const codigosUsados = codigosParceiro.filter(c => c.usado).length

    // Transações deste mês
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)

    const transacoesMes = await prisma.transacao.count({
      where: {
        codigoParceiro: {
          in: codigos
        },
        status: 'aprovada',
        data: {
          gte: inicioMes
        }
      }
    })

    // Usuários únicos que usaram códigos deste parceiro
    const usuariosUnicos = await prisma.transacao.findMany({
      where: {
        codigoParceiro: {
          in: codigos
        },
        status: 'aprovada'
      },
      select: {
        usuarioId: true
      },
      distinct: ['usuarioId']
    })

    const estatisticas = {
      totalVendas,
      totalComissoes,
      codigosAtivos,
      codigosUsados,
      transacoesMes,
      usuariosAtivos: usuariosUnicos.length
    }

    res.status(200).json(estatisticas)
  } catch (error) {
    console.error('Erro ao buscar estatísticas do parceiro:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 