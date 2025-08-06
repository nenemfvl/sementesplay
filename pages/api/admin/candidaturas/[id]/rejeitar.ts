import { prisma } from '../../../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Verificar autenticação via token Bearer
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticação necessário' })
      }

      const token = authHeader.substring(7)
      
      // Decodificar o token (simples para este exemplo)
      let user
      try {
        user = JSON.parse(Buffer.from(token, 'base64').toString())
      } catch (error) {
        return res.status(401).json({ error: 'Token inválido' })
      }

      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      // Verificar se é admin
      if (Number(user.nivel) < 5) {
        return res.status(403).json({ error: 'Acesso negado' })
      }

      const { id } = req.query
      const { observacoes } = req.body

      if (!observacoes || observacoes.trim().length < 10) {
        return res.status(400).json({ error: 'Observações são obrigatórias e devem ter pelo menos 10 caracteres' })
      }

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

      // Rejeitar candidatura
      await prisma.candidaturaCriador.update({
        where: { id: String(id) },
        data: {
          status: 'rejeitada',
          dataRevisao: new Date(),
          observacoes: observacoes
        }
      })

      // Log da ação
      await prisma.logAuditoria.create({
        data: {
          usuarioId: user.id,
          acao: 'REJEITAR_CANDIDATURA',
          detalhes: `Candidatura ${id} rejeitada. Candidato: ${candidatura.nome}`,
          ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
          nivel: 'info'
        }
      })

      // Enviar notificação
      await prisma.notificacao.create({
        data: {
          usuarioId: candidatura.usuarioId,
          titulo: 'Candidatura Revisada',
          mensagem: `Sua candidatura para criador foi revisada. Motivo: ${observacoes}. Você pode se candidatar novamente em 30 dias.`,
          tipo: 'candidatura_rejeitada',
          lida: false
        }
      })

      res.status(200).json({ 
        message: 'Candidatura rejeitada com sucesso',
        candidaturaId: id 
      })

    } catch (error) {
      console.error('Erro ao rejeitar candidatura:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ error: 'Método não permitido' })
  }
} 