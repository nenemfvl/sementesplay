import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { auth } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = auth.getUser()
  if (!user || Number(user.nivel) < 5) {
    return res.status(401).json({ error: 'Acesso negado' })
  }

  if (req.method === 'GET') {
    try {
      const { status, categoria } = req.query

      const where: any = {}
      if (status) where.status = status
      if (categoria) where.categoria = categoria

      const conversas = await prisma.conversaSuporte.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              nivel: true
            }
          },
          mensagens: {
            orderBy: {
              dataEnvio: 'asc'
            },
            include: {
              remetente: {
                select: {
                  id: true,
                  nome: true
                }
              }
            }
          }
        },
        orderBy: {
          dataAtualizacao: 'desc'
        }
      })

      return res.status(200).json({ conversas })
    } catch (error) {
      console.error('Erro ao buscar conversas:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { conversaId, mensagem, acao } = req.body

      if (acao === 'responder') {
        if (!conversaId || !mensagem) {
          return res.status(400).json({ error: 'Conversa ID e mensagem são obrigatórios' })
        }

        // Verificar se a conversa existe
        const conversa = await prisma.conversaSuporte.findUnique({
          where: { id: conversaId }
        })

        if (!conversa) {
          return res.status(404).json({ error: 'Conversa não encontrada' })
        }

        // Criar resposta do admin
        const resposta = await prisma.mensagemSuporte.create({
          data: {
            conversaId,
            remetenteId: user.id,
            mensagem,
            tipo: 'admin'
          }
        })

        // Atualizar status da conversa para "em_espera" se estava "aberta"
        if (conversa.status === 'aberta') {
          await prisma.conversaSuporte.update({
            where: { id: conversaId },
            data: { 
              status: 'em_espera',
              dataAtualizacao: new Date()
            }
          })
        }

        return res.status(201).json({ mensagem: resposta })
      }

      if (acao === 'atualizar_status') {
        const { conversaId, status } = req.body

        if (!conversaId || !status) {
          return res.status(400).json({ error: 'Conversa ID e status são obrigatórios' })
        }

        const dataAtualizacao: any = { status }
        if (status === 'fechada') {
          dataAtualizacao.dataFechamento = new Date()
        }

        const conversa = await prisma.conversaSuporte.update({
          where: { id: conversaId },
          data: {
            ...dataAtualizacao,
            dataAtualizacao: new Date()
          }
        })

        return res.status(200).json({ conversa })
      }

      return res.status(400).json({ error: 'Ação inválida' })
    } catch (error) {
      console.error('Erro ao processar ação:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
