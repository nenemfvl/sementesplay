import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  // Verificar autenticação via token
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação necessário' })
  }

  const token = authHeader.replace('Bearer ', '')
  
  // Buscar usuário pelo token (ID do usuário)
  const user = await prisma.usuario.findUnique({
    where: { id: token }
  })

  if (!user) {
    return res.status(401).json({ error: 'Usuário não autenticado' })
  }

  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'ID do conteúdo não informado' })

  try {
    // Verificar se o usuário já visualizou este conteúdo
    const interacaoExistente = await prisma.interacaoConteudo.findUnique({
      where: {
        conteudoId_usuarioId_tipo: {
          conteudoId: String(id),
          usuarioId: user.id,
          tipo: 'visualizacao'
        }
      }
    })

    if (interacaoExistente) {
      return res.status(200).json({ 
        success: true, 
        visualizacoes: 0, // Não incrementa se já visualizou
        message: 'Conteúdo já visualizado por este usuário'
      })
    }

    // Registrar a interação e incrementar visualizações
    await prisma.$transaction([
      prisma.interacaoConteudo.create({
        data: {
          conteudoId: String(id),
          usuarioId: user.id,
          tipo: 'visualizacao'
        }
      }),
      prisma.conteudo.update({
        where: { id: String(id) },
        data: { visualizacoes: { increment: 1 } }
      })
    ])

    const conteudo = await prisma.conteudo.findUnique({
      where: { id: String(id) }
    })

    return res.status(200).json({ 
      success: true, 
      visualizacoes: conteudo?.visualizacoes || 0 
    })
  } catch (error) {
    console.error('Erro ao registrar visualização:', error)
    return res.status(500).json({ error: 'Erro ao registrar visualização' })
  }
} 