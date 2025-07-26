import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { usuarioId } = req.body

    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId é obrigatório' })
    }

    // Verificar se já existe criador
    const criadorExistente = await prisma.criador.findUnique({
      where: { usuarioId: String(usuarioId) }
    })

    if (criadorExistente) {
      return res.status(400).json({ 
        error: 'Criador já existe',
        criador: criadorExistente
      })
    }

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: String(usuarioId) }
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Criar registro de criador
    const novoCriador = await prisma.criador.create({
      data: {
        usuarioId: usuario.id,
        nome: usuario.nome,
        bio: 'Criador de conteúdo da comunidade SementesPLAY',
        categoria: 'Gaming',
        redesSociais: '{}',
        portfolio: '{}',
        nivel: usuario.nivel,
        sementes: usuario.sementes,
        apoiadores: 0,
        doacoes: 0
      }
    })

    res.status(200).json({
      success: true,
      message: 'Criador criado com sucesso',
      criador: novoCriador
    })

  } catch (error) {
    console.error('Erro ao criar criador:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 