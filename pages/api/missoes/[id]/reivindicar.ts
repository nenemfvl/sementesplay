import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { id } = req.query
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'Token de autenticação necessário' })
    }

    // Buscar usuário pelo token
    const usuario = await prisma.usuario.findFirst({
      where: {
        token: token
      }
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Buscar missão
    const missao = await prisma.missao.findUnique({
      where: { id: String(id) }
    })

    if (!missao) {
      return res.status(404).json({ error: 'Missão não encontrada' })
    }

    // Buscar progresso do usuário na missão
    const missaoUsuario = await prisma.missaoUsuario.findFirst({
      where: {
        missaoId: String(id),
        usuarioId: usuario.id
      }
    })

    if (!missaoUsuario || !missaoUsuario.concluida) {
      return res.status(400).json({ error: 'Missão não foi completada' })
    }

    if (missaoUsuario.reivindicada) {
      return res.status(400).json({ error: 'Recompensa já foi reivindicada' })
    }

    // Marcar missão como reivindicada
    await prisma.missaoUsuario.update({
      where: { id: missaoUsuario.id },
      data: { reivindicada: true }
    })

    // Atualizar sementes do usuário
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        sementes: usuario.sementes + missao.recompensa
      }
    })

    // Criar registro de semente ganha
    await prisma.semente.create({
      data: {
        usuarioId: usuario.id,
        quantidade: missao.recompensa,
        tipo: 'recompensa_missao',
        descricao: `Recompensa da missão: ${missao.titulo}`
      }
    })

    // Criar notificação
    await prisma.notificacao.create({
      data: {
        usuarioId: usuario.id,
        tipo: 'missao',
        titulo: 'Missão Completada!',
        mensagem: `Você ganhou ${missao.recompensa} Sementes por completar a missão "${missao.titulo}"!`,
        lida: false
      }
    })

    return res.status(200).json({ 
      message: 'Recompensa reivindicada com sucesso',
      recompensa: missao.recompensa
    })
  } catch (error) {
    console.error('Erro ao reivindicar recompensa:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 