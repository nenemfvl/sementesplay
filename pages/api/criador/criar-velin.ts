import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Buscar usuário 'velin'
    const usuario = await prisma.usuario.findFirst({
      where: {
        nome: 'velin'
      }
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário velin não encontrado' })
    }

    // Verificar se já existe criador
    const criadorExistente = await prisma.criador.findUnique({
      where: { usuarioId: usuario.id }
    })

    if (criadorExistente) {
      return res.status(200).json({
        success: true,
        message: 'Criador já existe',
        criador: criadorExistente,
        usuario
      })
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
      message: 'Criador criado com sucesso para velin!',
      criador: novoCriador,
      usuario
    })

  } catch (error) {
    console.error('Erro ao criar criador para velin:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 