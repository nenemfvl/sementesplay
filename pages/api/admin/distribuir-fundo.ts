import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { enviarNotificacaoComSom } from '../../../lib/notificacao'

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

    // Busca criadores ativos com contagem de conteúdos
    const criadores = await prisma.criador.findMany({
      include: {
        _count: {
          select: { conteudos: true }
        }
      },
      where: {
        conteudos: {
          some: { removido: false }  // Apenas criadores com conteúdo ativo
        }
      }
    })
    
    // Busca usuários que fizeram doações no período do fundo
    const doacoes = await prisma.doacao.findMany({
      where: {
        data: {
          gte: fundo.dataInicio,
          lte: fundo.dataFim
        }
      },
      select: { doadorId: true, valor: true }
    })
    
    // Soma total doado por usuário
    const gastoPorUsuario: Record<string, number> = {}
    let totalGasto = 0
    for (const doacao of doacoes) {
      gastoPorUsuario[doacao.doadorId] = (gastoPorUsuario[doacao.doadorId] || 0) + doacao.valor
      totalGasto += doacao.valor
    }
    const usuariosUnicos = Array.from(new Set(doacoes.map(d => d.doadorId)))

    // Calcula distribuição proporcional para criadores baseada na quantidade de conteúdo
    const totalConteudos = criadores.reduce((sum, criador) => sum + criador._count.conteudos, 0)
    const valorPorUsuario = usuariosUnicos.length > 0 ? valorUsuarios / usuariosUnicos.length : 0

    await prisma.$transaction(async (tx) => {
      // Distribui para criadores proporcionalmente à quantidade de conteúdo
      for (const criador of criadores) {
        const proporcao = totalConteudos > 0 ? criador._count.conteudos / totalConteudos : 0
        const valorCriador = valorCriadores * proporcao
        
        await tx.distribuicaoFundo.create({
          data: {
            fundoId: fundo.id,
            criadorId: criador.id,
            valor: valorCriador,
            tipo: 'criador'
          }
        })
        await tx.usuario.update({
          where: { id: criador.usuarioId },
          data: { sementes: { increment: valorCriador } }
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
      const proporcao = totalConteudos > 0 ? criador._count.conteudos / totalConteudos : 0
      const valorCriador = valorCriadores * proporcao
      await enviarNotificacaoComSom(criador.usuarioId, 'fundo', 'Fundo de sementes distribuído!', `Você recebeu ${valorCriador.toFixed(2)} sementes do fundo de sementes.`)
    }
    for (const usuarioId of Object.keys(gastoPorUsuario)) {
      const proporcao = gastoPorUsuario[usuarioId] / totalGasto
      const valorUsuario = valorUsuarios * proporcao
      await enviarNotificacaoComSom(usuarioId, 'fundo', 'Fundo de sementes distribuído!', `Você recebeu ${valorUsuario.toFixed(2)} sementes do fundo de sementes.`)
    }

    return res.status(200).json({ message: 'Fundo de sementes distribuído com sucesso!' })
  } catch (error) {
    console.error('Erro ao distribuir fundo:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 