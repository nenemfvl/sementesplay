import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    try {
      const { id } = req.query
      const { status, motivoRejeicao } = req.body

      // Verificar se é admin (nivel 5)
      const user = await prisma.usuario.findFirst({
        where: { nivel: '5' }
      })

      if (!user) {
        return res.status(403).json({ error: 'Acesso negado - Admin não encontrado' })
      }

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'ID do saque é obrigatório' })
      }

      if (!status || !['pendente', 'processando', 'aprovado', 'rejeitado', 'concluido'].includes(status)) {
        return res.status(400).json({ error: 'Status inválido' })
      }

      // Buscar o saque
      const saque = await prisma.saque.findUnique({
        where: { id: String(id) },
        include: { usuario: true }
      })

      if (!saque) {
        return res.status(404).json({ error: 'Saque não encontrado' })
      }

      // Atualizar status do saque
      const saqueAtualizado = await prisma.saque.update({
        where: { id: String(id) },
        data: {
          status,
          motivoRejeicao: motivoRejeicao || null,
          dataProcessamento: status === 'processando' ? new Date() : saque.dataProcessamento,
          dataConclusao: ['aprovado', 'rejeitado', 'concluido'].includes(status) ? new Date() : saque.dataConclusao
        }
      })

      // Log de auditoria
      await prisma.logAuditoria.create({
        data: {
          usuarioId: user.id,
          acao: 'ATUALIZAR_STATUS_SAQUE',
          detalhes: `Status do saque ${id} alterado para ${status}. Usuário: ${saque.usuario.nome} (${saque.usuario.email}). Valor: R$ ${saque.valor.toFixed(2)}${motivoRejeicao ? `. Motivo: ${motivoRejeicao}` : ''}`,
          ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
          nivel: status === 'rejeitado' ? 'warning' : 'info'
        }
      })

      // Se rejeitado, devolver sementes ao usuário
      if (status === 'rejeitado') {
        const sementesDevolver = Math.floor(saque.valor) // 1 real = 1 semente

        await prisma.$transaction(async (tx) => {
          // Devolver sementes
          await tx.usuario.update({
            where: { id: saque.usuarioId },
            data: {
              sementes: { increment: sementesDevolver }
            }
          })

          // Registrar histórico
          await tx.semente.create({
            data: {
              usuarioId: saque.usuarioId,
              quantidade: sementesDevolver,
              tipo: 'devolucao_saque',
              descricao: `Devolução de sementes - Saque rejeitado de ${saque.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
            }
          })

          // Criar notificação
          await tx.notificacao.create({
            data: {
              usuarioId: saque.usuarioId,
              tipo: 'saque_rejeitado',
              titulo: 'Saque Rejeitado',
              mensagem: `Seu saque de ${saque.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} foi rejeitado. ${motivoRejeicao ? `Motivo: ${motivoRejeicao}` : ''} As sementes foram devolvidas à sua conta.`
            }
          })
        })
      }

      // Se aprovado, criar notificação
      if (status === 'aprovado') {
        await prisma.notificacao.create({
          data: {
            usuarioId: saque.usuarioId,
            tipo: 'saque_aprovado',
            titulo: 'Saque Aprovado',
            mensagem: `Seu saque de ${saque.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} foi aprovado e será processado em breve.`
          }
        })
      }

      res.status(200).json({
        success: true,
        message: 'Status atualizado com sucesso',
        saque: saqueAtualizado
      })

    } catch (error) {
      console.error('Erro ao atualizar status do saque:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    res.setHeader('Allow', ['PUT'])
    res.status(405).json({ error: 'Método não permitido' })
  }
} 