import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
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

    // Buscar repasses realizados pelo parceiro
    const repassesRealizados = await prisma.repasseParceiro.findMany({
      where: {
        parceiroId: parceiro.id,
        status: 'pago'
      }
    })

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
    const totalRepasses = repassesRealizados.reduce((sum, r) => sum + r.valor, 0)
    const totalComissoes = transacoes.reduce((sum, t) => sum + t.valor, 0) * 0.1 // 10% de comissão
    const codigosAtivos = codigosParceiro.filter(c => !c.usado).length
    const quantidadeRepasses = repassesRealizados.length // Quantidade de repasses realizados

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

    // Usuários únicos que receberam repasses deste parceiro
    const usuariosComRepasse = await prisma.repasseParceiro.findMany({
      where: {
        parceiroId: parceiro.id,
        status: 'pago'
      },
      select: {
        compra: {
          select: {
            usuarioId: true
          }
        }
      }
    })

    // Extrair usuários únicos dos repasses
    const usuariosIds = usuariosComRepasse.map(r => r.compra.usuarioId)
    const usuariosUnicosComRepasse = usuariosIds.filter((id, index) => usuariosIds.indexOf(id) === index)

    const estatisticas = {
      totalVendas: totalRepasses, // Agora mostra o total de repasses realizados
      totalComissoes,
      codigosAtivos,
      repassesRealizados: quantidadeRepasses, // Agora mostra a quantidade de repasses realizados
      transacoesMes,
      usuariosAtivos: usuariosUnicosComRepasse.length
    }

    res.status(200).json(estatisticas)
  } catch (error) {
    console.error('Erro ao buscar estatísticas do parceiro:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 