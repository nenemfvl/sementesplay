import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { auth } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 [SUPORTE API] Iniciando requisição...')
  console.log('🍪 Cookies recebidos:', req.headers.cookie)
  console.log('📋 Headers:', req.headers)
  
  let user = auth.getUserFromCookies(req.headers.cookie || '')
  console.log('👤 Usuário extraído dos cookies:', user)
  
  // Fallback: tentar extrair usuário do header Authorization se não encontrou nos cookies
  if (!user && req.headers.authorization) {
    try {
      const authHeader = req.headers.authorization.replace('Bearer ', '')
      user = JSON.parse(decodeURIComponent(authHeader))
      console.log('👤 Usuário extraído do header Authorization:', user)
    } catch (error) {
      console.log('❌ Erro ao extrair usuário do header:', error)
    }
  }
  
  // Verificar se é admin - APENAS nível '5'
  const isAdmin = user && user.nivel === '5'
  console.log('🔐 Verificação de admin:', { user: !!user, nivel: user?.nivel, isAdmin })
  
  if (!user || !isAdmin) {
    console.log('❌ Acesso negado - Apenas administradores nível 5 podem acessar. Usuário:', user?.nome, 'Nível:', user?.nivel)
    return res.status(401).json({ error: 'Acesso negado. Apenas administradores nível 5 podem acessar o suporte.' })
  }
  
  console.log('✅ Admin nível 5 autenticado:', user.nome, 'Nível:', user.nivel)

  if (req.method === 'GET') {
    try {
      const { status, categoria } = req.query

      // Construir filtros
      const where: any = {}
      if (status && status !== 'todos') {
        where.status = status
      }
      if (categoria && categoria !== 'todos') {
        where.categoria = categoria
      }

      // Buscar conversas
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
            include: {
              remetente: {
                select: {
                  id: true,
                  nome: true
                }
              }
            },
            orderBy: {
              dataEnvio: 'asc'
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
      const { conversaId, mensagem, acao, status } = req.body

      if (acao === 'responder') {
        if (!conversaId || !mensagem) {
          return res.status(400).json({ error: 'Conversa ID e mensagem são obrigatórios' })
        }

        // Verificar se a conversa existe
        const conversa = await prisma.conversaSuporte.findFirst({
          where: { id: conversaId }
        })

        if (!conversa) {
          return res.status(404).json({ error: 'Conversa não encontrada' })
        }

        // Criar mensagem do admin
        const novaMensagem = await prisma.mensagemSuporte.create({
          data: {
            conversaId,
            remetenteId: user.id,
            mensagem,
            tipo: 'admin'
          }
        })

        // Atualizar status da conversa para "em espera"
        await prisma.conversaSuporte.update({
          where: { id: conversaId },
          data: { 
            status: 'em_espera',
            dataAtualizacao: new Date()
          }
        })

        return res.status(201).json({ mensagem: novaMensagem })
      }

      if (acao === 'atualizar_status') {
        if (!conversaId || !status) {
          return res.status(400).json({ error: 'Conversa ID e status são obrigatórios' })
        }

        const conversa = await prisma.conversaSuporte.update({
          where: { id: conversaId },
          data: { 
            status,
            dataAtualizacao: new Date(),
            ...(status === 'fechada' && { dataFechamento: new Date() })
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
