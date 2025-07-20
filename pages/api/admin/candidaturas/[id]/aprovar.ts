import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { auth } from '../../../../../lib/auth'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Verificar autenticação
      const user = auth.getUser()
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      // Verificar se é admin
      if (Number(user.nivel) < 5) {
        return res.status(403).json({ error: 'Acesso negado' })
      }

      const { id } = req.query
      const { observacoes } = req.body

      // Buscar candidatura
      const candidatura = await prisma.candidaturaCriador.findUnique({
        where: { id: String(id) }
      })

      if (!candidatura) {
        return res.status(404).json({ error: 'Candidatura não encontrada' })
      }

      if (candidatura.status !== 'pendente') {
        return res.status(400).json({ error: 'Candidatura já foi processada' })
      }

      // Aprovar candidatura
      await prisma.candidaturaCriador.update({
        where: { id: String(id) },
        data: {
          status: 'aprovada',
          dataRevisao: new Date(),
          observacoes: observacoes || 'Candidatura aprovada pela equipe de administração.'
        }
      })

      // Criar registro de criador
      await prisma.criador.create({
        data: {
          usuarioId: candidatura.usuarioId,
          nome: candidatura.nome,
          bio: candidatura.bio,
          categoria: candidatura.categoria,
          redesSociais: candidatura.redesSociais,
          portfolio: candidatura.portfolio,
          nivel: 'comum',
          sementes: 0,
          apoiadores: 0,
          doacoes: 0,
          dataCriacao: new Date()
        }
      })

      // Atualizar tipo do usuário
      await prisma.usuario.update({
        where: { id: candidatura.usuarioId },
        data: { tipo: 'criador' }
      })

      // Log da ação
      await prisma.logAuditoria.create({
        data: {
          usuarioId: user.id,
          acao: 'APROVAR_CANDIDATURA',
          detalhes: `Candidatura ${id} aprovada. Candidato: ${candidatura.nome}`,
          ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
          nivel: 'info'
        }
      })

      // Enviar notificação (implementar sistema de notificações)
      await prisma.notificacao.create({
        data: {
          usuarioId: candidatura.usuarioId,
          titulo: 'Candidatura Aprovada! 🎉',
          mensagem: 'Parabéns! Sua candidatura para criador foi aprovada. Você agora pode começar a receber doações da comunidade.',
          tipo: 'candidatura_aprovada',
          lida: false,
          dataCriacao: new Date()
        }
      })

      res.status(200).json({ 
        message: 'Candidatura aprovada com sucesso',
        candidaturaId: id 
      })

    } catch (error) {
      console.error('Erro ao aprovar candidatura:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ error: 'Método não permitido' })
  }
} 