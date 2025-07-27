import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Verificar autenticação via token Bearer
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticação não fornecido' })
      }

      const userId = authHeader.replace('Bearer ', '')
      
      // Verificar se o usuário existe
      const user = await prisma.usuario.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' })
      }

      const {
        nome,
        email,
        bio,
        categoria,
        redesSociais,
        portfolio,
        experiencia,
        motivacao,
        metas,
        disponibilidade
      } = req.body

             // Validações básicas
       if (!nome || !email || !bio) {
         return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' })
       }

      if (bio.length < 50) {
        return res.status(400).json({ error: 'Biografia deve ter pelo menos 50 caracteres' })
      }

      if (experiencia.length < 30) {
        return res.status(400).json({ error: 'Experiência deve ter pelo menos 30 caracteres' })
      }

      if (motivacao.length < 30) {
        return res.status(400).json({ error: 'Motivação deve ter pelo menos 30 caracteres' })
      }

      // Verificar se já existe candidatura pendente
      const candidaturaExistente = await prisma.candidaturaCriador.findFirst({
        where: {
          usuarioId: user.id,
          status: 'pendente'
        }
      })

      if (candidaturaExistente) {
        return res.status(400).json({ error: 'Você já possui uma candidatura pendente' })
      }

      // Verificar se já é criador
      const criadorExistente = await prisma.criador.findFirst({
        where: {
          usuarioId: user.id
        }
      })

      if (criadorExistente) {
        return res.status(400).json({ error: 'Você já é um criador aprovado' })
      }

             // Criar candidatura
       const candidatura = await prisma.candidaturaCriador.create({
         data: {
           usuarioId: user.id,
           nome,
           email,
           bio,
           categoria: 'Streamer', // Categoria padrão
           redesSociais: JSON.stringify(redesSociais),
           portfolio: JSON.stringify(portfolio),
           experiencia,
           motivacao,
           metas,
           disponibilidade,
           status: 'pendente',
           dataCandidatura: new Date()
         }
       })

             // Log da ação
       await prisma.logAuditoria.create({
         data: {
           usuarioId: user.id,
           acao: 'CANDIDATURA_CRIADOR',
           detalhes: 'Candidatura enviada para criador',
           ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '',
           userAgent: req.headers['user-agent'] || '',
           nivel: 'info'
         }
       })

      res.status(201).json({ 
        message: 'Candidatura enviada com sucesso',
        candidaturaId: candidatura.id 
      })

    } catch (error) {
      console.error('Erro ao criar candidatura:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else if (req.method === 'GET') {
    try {
      // Verificar autenticação via token Bearer
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticação não fornecido' })
      }

      const token = authHeader.substring(7)
      const user = await prisma.usuario.findUnique({
        where: { id: token }
      })

      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' })
      }

      // Buscar candidaturas do usuário
      const candidaturas = await prisma.candidaturaCriador.findMany({
        where: {
          usuarioId: user.id
        },
        orderBy: {
          dataCandidatura: 'desc'
        }
      })

      res.status(200).json({ candidaturas })

    } catch (error) {
      console.error('Erro ao buscar candidaturas:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET'])
    res.status(405).json({ error: 'Método não permitido' })
  }
} 