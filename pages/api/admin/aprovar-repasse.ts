import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { enviarNotificacao } from '../../../lib/notificacao'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { repasseId } = req.body
    if (!repasseId) {
      return res.status(400).json({ error: 'ID do repasse obrigatório' })
    }

    // Busca o repasse e a compra vinculada
    const repasse = await prisma.repasseParceiro.findUnique({
      where: { id: repasseId },
      include: { compra: true, parceiro: true }
    })
    if (!repasse) {
      return res.status(404).json({ error: 'Repasse não encontrado' })
    }
    if (repasse.status !== 'pendente') {
      return res.status(400).json({ error: 'Repasse já processado' })
    }

    const compra = repasse.compra
    const parceiro = repasse.parceiro
    if (!compra || !parceiro) {
      return res.status(400).json({ error: 'Dados inconsistentes' })
    }

    // Calcula as porcentagens - NOVO FLUXO
    const valor = repasse.valor
    const pctUsuario = Math.round(valor * 0.05)    // 5% para jogador
    const pctSistema = valor * 0.025               // 2,5% para sistema SementesPLAY
    const pctFundo = valor * 0.025                 // 2,5% para fundo de distribuição

    // Transação: atualiza tudo de uma vez
    await prisma.$transaction(async (tx) => {
      // Atualiza repasse para confirmado
      await tx.repasseParceiro.update({
        where: { id: repasseId },
        data: { status: 'confirmado' }
      })
      // Atualiza compra para cashback_liberado
      await tx.compraParceiro.update({
        where: { id: compra.id },
        data: { status: 'cashback_liberado' }
      })
      // Atualiza saldo devedor do parceiro
      await tx.parceiro.update({
        where: { id: parceiro.id },
        data: { saldoDevedor: { decrement: valor } }
      })
      // Credita sementes para usuário
      await tx.usuario.update({
        where: { id: compra.usuarioId },
        data: { sementes: { increment: pctUsuario } }
      })
      
      // Sistema SementesPLAY recebe dinheiro (não sementes)
      // Aqui você pode implementar a lógica para creditar na conta do sistema
      // Por enquanto, vamos apenas registrar no histórico
      
      // Registra fundo de sementes
      const fundoExistente = await tx.fundoSementes.findFirst({
        where: { distribuido: false }
      });
      if (fundoExistente) {
        await tx.fundoSementes.update({
          where: { id: fundoExistente.id },
          data: { valorTotal: { increment: pctFundo } }
        });
      } else {
        await tx.fundoSementes.create({
          data: {
            ciclo: 1, // lógica de ciclo a ser implementada
            valorTotal: pctFundo,
            dataInicio: new Date(),
            dataFim: new Date(),
            distribuido: false
          }
        });
      }
      // Registra histórico de sementes (apenas para o jogador)
      await tx.semente.createMany({
        data: [
          {
            usuarioId: compra.usuarioId,
            quantidade: pctUsuario,
            tipo: 'resgatada',
            descricao: `Cashback compra parceiro ${compra.id}`
          }
        ]
      })
    })
    // Notificações fora da transação
    await enviarNotificacao(compra.usuarioId, 'cashback', 'Cashback liberado!', `Seu cashback da compra foi liberado e você recebeu ${pctUsuario} sementes.`)

    return res.status(200).json({ message: 'Repasse aprovado, cashback e porcentagens distribuídos com sucesso!' })
  } catch (error) {
    console.error('Erro ao aprovar repasse:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 