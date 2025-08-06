import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { auth } from '../../../../lib/auth'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { id } = req.query
    const user = auth.getUser()

    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID da missão é obrigatório' })
    }

    // Buscar a missão
    const missao = await prisma.missao.findUnique({
      where: { id: String(id) }
    })

    if (!missao) {
      return res.status(404).json({ error: 'Missão não encontrada' })
    }

    if (!missao.ativa) {
      return res.status(400).json({ error: 'Missão não está ativa' })
    }

    // Verificar se o usuário já completou esta missão
    const missaoCompletada = await prisma.missaoUsuario.findFirst({
      where: {
        usuarioId: user.id,
        missaoId: String(id)
      }
    })

    if (missaoCompletada) {
      return res.status(400).json({ error: 'Missão já foi completada' })
    }

    // Completar missão
    const resultado = await prisma.$transaction(async (tx) => {
      // Registrar conclusão da missão
      const missaoUsuario = await tx.missaoUsuario.create({
        data: {
          usuarioId: user.id,
          missaoId: String(id),
          concluida: true,
          dataConclusao: new Date()
        }
      })

      // Dar recompensa (sementes)
      if (missao.recompensa > 0) {
        await tx.usuario.update({
          where: { id: user.id },
          data: {
            sementes: { increment: missao.recompensa }
          }
        })

        // Registrar histórico de sementes
        await tx.semente.create({
          data: {
            usuarioId: user.id,
            quantidade: missao.recompensa,
            tipo: 'missao',
            descricao: `Recompensa da missão: ${missao.titulo}`
          }
        })
      }

      return { missaoUsuario, recompensa: missao.recompensa }
    })

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuarioId: user.id,
        acao: 'COMPLETAR_MISSAO',
        detalhes: `Missão ${id} (${missao.titulo}) completada. Recompensa: ${resultado.recompensa} sementes`,
        ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '',
        userAgent: req.headers['user-agent'] || '',
        nivel: 'info'
      }
    })

    return res.status(200).json({
      success: true,
      message: 'Missão completada com sucesso!',
      recompensa: {
        sementes: resultado.recompensa,
        missao: missao.titulo
      }
    })
  } catch (error) {
    console.error('Erro ao completar missão:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 