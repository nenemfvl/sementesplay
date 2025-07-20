import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { id } = req.query
    const { usuarioId } = req.body

    if (!id || !usuarioId) {
      return res.status(400).json({ error: 'ID da missão e usuário são obrigatórios' })
    }

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: String(usuarioId) }
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Definir recompensas baseadas no ID da missão
    const recompensas = {
      'diaria_login': 50,
      'diaria_doacao': 100,
      'diaria_cashback': 75,
      'semanal_doacoes': 500,
      'semanal_criadores': 300,
      'semanal_cashback': 250,
      'especial_primeira_doacao': 1000,
      'especial_doador_ouro': 5000,
      'especial_cashback_master': 2000
    }

    const sementesGanhas = recompensas[String(id) as keyof typeof recompensas] || 0

    if (sementesGanhas === 0) {
      return res.status(400).json({ error: 'Missão inválida' })
    }

    // Atualizar sementes do usuário
    await prisma.usuario.update({
      where: { id: String(usuarioId) },
      data: {
        sementes: usuario.sementes + sementesGanhas
      }
    })

    // Criar registro de semente ganha
    await prisma.semente.create({
      data: {
        usuarioId: String(usuarioId),
        quantidade: sementesGanhas,
        tipo: 'recompensa',
        descricao: `Recompensa da missão: ${String(id)}`
      }
    })

    // Criar notificação
    await prisma.notificacao.create({
      data: {
        usuarioId: String(usuarioId),
        tipo: 'ranking',
        titulo: 'Recompensa Reivindicada!',
        mensagem: `Você ganhou ${sementesGanhas} Sementes por completar uma missão!`,
        lida: false
      }
    })

    return res.status(200).json({ 
      message: 'Recompensa reivindicada com sucesso',
      sementesGanhas
    })
  } catch (error) {
    console.error('Erro ao reivindicar recompensa:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 