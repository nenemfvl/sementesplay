import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { usuarioId } = req.body

  if (!usuarioId) {
    return res.status(400).json({ error: 'usuarioId é obrigatório' })
  }

  try {
    // Verificar se o usuário existe e tem nível criador
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    if (usuario.nivel !== 'criador') {
      return res.status(400).json({ error: 'Usuário não tem nível de criador' })
    }

    // Verificar se já existe um criador para este usuário
    const criadorExistente = await prisma.criador.findUnique({
      where: { usuarioId: usuarioId }
    })

    if (criadorExistente) {
      return res.status(200).json({ 
        message: 'Criador já existe',
        criador: criadorExistente
      })
    }

    // Criar o registro de criador
    const novoCriador = await prisma.criador.create({
      data: {
        usuarioId: usuarioId,
        nome: usuario.nome,
        bio: 'Criador de conteúdo da comunidade SementesPLAY',
        categoria: 'geral',
        redesSociais: JSON.stringify({
          youtube: '',
          twitch: '',
          instagram: ''
        }),
        portfolio: JSON.stringify([]),
        nivel: 'comum',
        sementes: 0,
        apoiadores: 0,
        doacoes: 0
      }
    })

    console.log('Criador criado com sucesso:', novoCriador)

    return res.status(201).json({
      message: 'Criador criado com sucesso',
      criador: novoCriador
    })

  } catch (error) {
    console.error('Erro ao criar criador:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 