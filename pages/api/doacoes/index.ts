import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { doadorId, criadorId, quantidade, mensagem } = req.body

    // Validações básicas
    if (!doadorId || !criadorId || !quantidade) {
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' })
    }

    if (quantidade <= 0) {
      return res.status(400).json({ error: 'Quantidade deve ser maior que zero' })
    }

    // Verificar se o doador existe e tem sementes suficientes
    const doador = await prisma.usuario.findUnique({
      where: { id: doadorId }
    })

    if (!doador) {
      return res.status(404).json({ error: 'Doador não encontrado' })
    }

    if (doador.sementes < quantidade) {
      return res.status(400).json({ error: 'Sementes insuficientes' })
    }

    // Verificar se o criador existe
    const criador = await prisma.criador.findUnique({
      where: { id: criadorId },
      include: { usuario: true }
    })

    if (!criador) {
      return res.status(404).json({ error: 'Criador não encontrado' })
    }

    // Calcular valores (90% para o criador, 10% para manutenção)
    const valorCriador = Math.floor(quantidade * 0.9)
    const valorManutencao = quantidade - valorCriador

    // Iniciar transação
    const resultado = await prisma.$transaction(async (tx) => {
      // Deduzir sementes do doador
      await tx.usuario.update({
        where: { id: doadorId },
        data: { sementes: { decrement: quantidade } }
      })

      // Adicionar sementes ao criador
      await tx.usuario.update({
        where: { id: criador.usuarioId },
        data: { sementes: { increment: valorCriador } }
      })

      // Criar registro de doação
      const doacao = await tx.doacao.create({
        data: {
          doadorId,
          criadorId,
          quantidade,
          mensagem: mensagem || null
        }
      })

      // Atualizar estatísticas do criador
      await tx.criador.update({
        where: { id: criadorId },
        data: {
          //seguidores: { increment: 1 } // Incrementar seguidores se for primeira doação
        }
      })

      // Registrar histórico de sementes do doador
      await tx.semente.create({
        data: {
          usuarioId: doadorId,
          quantidade: -quantidade,
          tipo: 'doada',
          descricao: `Doação para ${criador.usuario.nome}`
        }
      })

      // Registrar histórico de sementes do criador
      await tx.semente.create({
        data: {
          usuarioId: criador.usuarioId,
          quantidade: valorCriador,
          tipo: 'recebida',
          descricao: `Doação de ${doador.nome}`
        }
      })

      // Criar notificação para o criador
      await tx.notificacao.create({
        data: {
          usuarioId: criador.usuarioId,
          tipo: 'doacao',
          titulo: 'Nova doação recebida!',
          mensagem: `${doador.nome} doou ${quantidade} Sementes para você!`
        }
      })

      return doacao
    })

    res.status(201).json({
      message: 'Doação realizada com sucesso',
      doacao: resultado
    })

  } catch (error) {
    console.error('Erro ao criar doação:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 