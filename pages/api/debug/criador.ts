import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { usuarioId } = req.query

  if (!usuarioId) {
    return res.status(400).json({ error: 'usuarioId é obrigatório' })
  }

  try {
    console.log('Debug: Buscando criador para usuarioId:', usuarioId)

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: String(usuarioId) },
      select: {
        id: true,
        nome: true,
        email: true,
        nivel: true,
        tipo: true
      }
    })

    console.log('Debug: Usuário encontrado:', usuario)

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado', usuarioId })
    }

    // Buscar criador
    const criador = await prisma.criador.findUnique({
      where: { usuarioId: String(usuarioId) },
      select: {
        id: true,
        usuarioId: true,
        nome: true,
        bio: true,
        categoria: true,
        nivel: true,
        dataCriacao: true
      }
    })

    console.log('Debug: Criador encontrado:', criador)

    // Buscar todos os criadores para debug
    const todosCriadores = await prisma.criador.findMany({
      select: {
        id: true,
        usuarioId: true,
        nome: true
      }
    })

    console.log('Debug: Todos os criadores:', todosCriadores)

    // Buscar todos os usuários com nível criador
    const usuariosCriadores = await prisma.usuario.findMany({
      where: { nivel: 'criador' },
      select: {
        id: true,
        nome: true,
        nivel: true
      }
    })

    console.log('Debug: Usuários com nível criador:', usuariosCriadores)

    return res.status(200).json({
      usuario,
      criador,
      todosCriadores,
      usuariosCriadores,
      existeCriador: !!criador,
      usuarioId: String(usuarioId)
    })
  } catch (error) {
    console.error('Erro no debug:', error)
    return res.status(500).json({ error: 'Erro interno do servidor', details: error })
  }
} 