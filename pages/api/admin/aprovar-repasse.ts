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

    // Calcula as porcentagens
    const valor = repasse.valor
    const pctUsuario = valor * 0.10
    const pctParceiro = valor * 0.05
    const pctManutencao = valor * 0.03
    const pctFundo = valor * 0.02

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
      // Credita sementes para parceiro (bônus)
      await tx.usuario.update({
        where: { id: parceiro.usuarioId },
        data: { sementes: { increment: pctParceiro } }
      })
      // Registra manutenção (pode ser um usuário do sistema ou só registro interno)
      // Registra fundo de sementes
      await tx.fundoSementes.upsert({
        where: { distribuido: false },
        update: { valorTotal: { increment: pctFundo } },
        create: {
          ciclo: 1, // lógica de ciclo a ser implementada
          valorTotal: pctFundo,
          dataInicio: new Date(),
          dataFim: new Date(),
          distribuido: false
        }
      })
      // Registra histórico de sementes para usuário e parceiro
      await tx.semente.createMany({
        data: [
          {
            usuarioId: compra.usuarioId,
            quantidade: pctUsuario,
            tipo: 'resgatada',
            descricao: `Cashback compra parceiro ${compra.id}`
          },
          {
            usuarioId: parceiro.usuarioId,
            quantidade: pctParceiro,
            tipo: 'bonus',
            descricao: `Bônus parceiro compra ${compra.id}`
          }
        ]
      })
    })
    // Notificações fora da transação
    await enviarNotificacao(compra.usuarioId, 'cashback', 'Cashback liberado!', `Seu cashback da compra foi liberado e você recebeu ${pctUsuario.toFixed(2)} sementes.`)
    await enviarNotificacao(parceiro.usuarioId, 'repasse', 'Repasse aprovado!', `Seu repasse da compra ${compra.id} foi aprovado e você recebeu ${pctParceiro.toFixed(2)} sementes de bônus.`)

    return res.status(200).json({ message: 'Repasse aprovado, cashback e porcentagens distribuídos com sucesso!' })
  } catch (error) {
    console.error('Erro ao aprovar repasse:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 