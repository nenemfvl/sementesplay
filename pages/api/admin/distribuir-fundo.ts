import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { enviarNotificacao } from '../../../lib/notificacao'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Busca o fundo de sementes não distribuído
    const fundo = await prisma.fundoSementes.findFirst({ where: { distribuido: false } })
    if (!fundo) {
      return res.status(404).json({ error: 'Nenhum fundo de sementes pendente de distribuição' })
    }

    const valorCriadores = fundo.valorTotal * 0.5
    const valorUsuarios = fundo.valorTotal * 0.5

    // Busca criadores ativos
    const criadores = await prisma.criador.findMany()
    // Busca usuários que fizeram compras no ciclo
    const compras = await prisma.compraParceiro.findMany({
      where: {
        dataCompra: {
          gte: fundo.dataInicio,
          lte: fundo.dataFim
        },
        status: 'cashback_liberado'
      },
      select: { usuarioId: true, valorCompra: true }
    })
    // Soma total gasto por usuário
    const gastoPorUsuario: Record<string, number> = {}
    let totalGasto = 0
    for (const compra of compras) {
      gastoPorUsuario[compra.usuarioId] = (gastoPorUsuario[compra.usuarioId] || 0) + compra.valorCompra
      totalGasto += compra.valorCompra
    }
    const usuariosUnicos = Array.from(new Set(compras.map(c => c.usuarioId)))

    // Divide igualmente entre criadores e usuários
    const valorPorCriador = criadores.length > 0 ? valorCriadores / criadores.length : 0
    const valorPorUsuario = usuariosUnicos.length > 0 ? valorUsuarios / usuariosUnicos.length : 0

    await prisma.$transaction(async (tx) => {
      // Distribui para criadores
      for (const criador of criadores) {
        await tx.distribuicaoFundo.create({
          data: {
            fundoId: fundo.id,
            criadorId: criador.id,
            valor: valorPorCriador,
            tipo: 'criador'
          }
        })
        await tx.usuario.update({
          where: { id: criador.usuarioId },
          data: { sementes: { increment: valorPorCriador } }
        })
      }
      // Distribui para usuários proporcional ao valor gasto
      for (const usuarioId of Object.keys(gastoPorUsuario)) {
        const proporcao = gastoPorUsuario[usuarioId] / totalGasto
        const valorUsuario = valorUsuarios * proporcao
        await tx.distribuicaoFundo.create({
          data: {
            fundoId: fundo.id,
            usuarioId,
            valor: valorUsuario,
            tipo: 'usuario'
          }
        })
        await tx.usuario.update({
          where: { id: usuarioId },
          data: { sementes: { increment: valorUsuario } }
        })
      }
      // Marca fundo como distribuído
      await tx.fundoSementes.update({
        where: { id: fundo.id },
        data: { distribuido: true }
      })
    })
    // Notificações fora da transação
    for (const criador of criadores) {
      await enviarNotificacao(criador.usuarioId, 'fundo', 'Fundo de sementes distribuído!', `Você recebeu ${valorPorCriador.toFixed(2)} sementes do fundo de sementes.`)
    }
    for (const usuarioId of Object.keys(gastoPorUsuario)) {
      const proporcao = gastoPorUsuario[usuarioId] / totalGasto
      const valorUsuario = valorUsuarios * proporcao
      await enviarNotificacao(usuarioId, 'fundo', 'Fundo de sementes distribuído!', `Você recebeu ${valorUsuario.toFixed(2)} sementes do fundo de sementes.`)
    }

    return res.status(200).json({ message: 'Fundo de sementes distribuído com sucesso!' })
  } catch (error) {
    console.error('Erro ao distribuir fundo:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 