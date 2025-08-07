import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { auth } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const user = auth.getUser()
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      const { conversaId, mensagem } = req.body

      if (!conversaId || !mensagem) {
        return res.status(400).json({ error: 'Conversa ID e mensagem são obrigatórios' })
      }

      // Verificar se a conversa existe e pertence ao usuário
      const conversa = await prisma.conversaSuporte.findFirst({
        where: {
          id: conversaId,
          usuarioId: user.id,
          status: { not: 'fechada' }
        }
      })

      if (!conversa) {
        return res.status(404).json({ error: 'Conversa não encontrada ou fechada' })
      }

      // Criar nova mensagem
      const novaMensagem = await prisma.mensagemSuporte.create({
        data: {
          conversaId,
          remetenteId: user.id,
          mensagem,
          tipo: 'usuario'
        }
      })

      // Atualizar data de atualização da conversa
      await prisma.conversaSuporte.update({
        where: { id: conversaId },
        data: { dataAtualizacao: new Date() }
      })

      return res.status(201).json({ mensagem: novaMensagem })
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
