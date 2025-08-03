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

    // Buscar usuário pelo ID do token (assumindo que o token contém o ID do usuário)
    // Por enquanto, vamos usar uma abordagem simples - buscar por email ou ID
    // Você pode implementar JWT decode aqui se necessário
    
    // Buscar usuário por ID (assumindo que o token é o ID do usuário)
    const usuario = await prisma.usuario.findUnique({
      where: {
        id: token
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

    // Atualizar XP do usuário (usar recompensa como XP)
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        xp: usuario.xp + missao.recompensa
      }
    })

    // Criar registro de XP ganho
    await prisma.historicoXP.create({
      data: {
        usuarioId: usuario.id,
        quantidade: missao.recompensa,
        tipo: 'missao',
        descricao: `XP ganho por completar a missão: ${missao.titulo}`
      }
    })

    // Criar notificação
    await prisma.notificacao.create({
      data: {
        usuarioId: usuario.id,
        tipo: 'missao',
        titulo: 'Missão Completada!',
        mensagem: `Você ganhou ${missao.recompensa} XP por completar a missão "${missao.titulo}"!`,
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