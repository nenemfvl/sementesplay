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

      // Atualizar apenas o nível do usuário (tipo permanece 'comum')
      await prisma.usuario.update({
        where: { id: candidatura.usuarioId },
        data: { 
          nivel: 'criador-iniciante'
        }
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

      // Enviar notificação
      await prisma.notificacao.create({
        data: {
          usuarioId: candidatura.usuarioId,
          titulo: 'Candidatura Aprovada! 🎉',
          mensagem: 'Parabéns! Sua candidatura para criador foi aprovada. Você agora tem acesso ao painel criador e pode começar a receber doações da comunidade.',
          tipo: 'candidatura_aprovada',
          lida: false
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