import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { auth } from '../../../lib/auth'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const user = auth.getUser()
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      // Buscar todas as conquistas ativas
      const conquistas = await prisma.conquista.findMany({
        where: { ativa: true },
        orderBy: { titulo: 'asc' }
      })

      // Buscar progresso do usuário em cada conquista
      const conquistasComProgresso = await Promise.all(
        conquistas.map(async (conquista) => {
          const progresso = await prisma.conquistaUsuario.findUnique({
            where: {
              conquistaId_usuarioId: {
                conquistaId: conquista.id,
                usuarioId: user.id
              }
            }
          })

          return {
            ...conquista,
            progresso: progresso?.progresso || 0,
            concluida: progresso?.concluida || false,
            dataConquista: progresso?.dataConquista
          }
        })
      )

      return res.status(200).json({
        conquistas: conquistasComProgresso
      })

    } catch (error) {
      console.error('Erro ao buscar conquistas:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else if (req.method === 'POST') {
    try {
      const user = auth.getUser()
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      const { conquistaId, progresso } = req.body

      if (!conquistaId || progresso === undefined) {
        return res.status(400).json({ error: 'Dados incompletos' })
      }

      // Buscar conquista
      const conquista = await prisma.conquista.findUnique({
        where: { id: conquistaId }
      })

      if (!conquista) {
        return res.status(404).json({ error: 'Conquista não encontrada' })
      }

      // Buscar ou criar progresso do usuário
      let progressoUsuario = await prisma.conquistaUsuario.findUnique({
        where: {
          conquistaId_usuarioId: {
            conquistaId,
            usuarioId: user.id
          }
        }
      })

      if (!progressoUsuario) {
        progressoUsuario = await prisma.conquistaUsuario.create({
          data: {
            conquistaId,
            usuarioId: user.id,
            progresso: 0
          }
        })
      }

      // Atualizar progresso
      const progressoAtualizado = await prisma.conquistaUsuario.update({
        where: { id: progressoUsuario.id },
        data: {
          progresso,
          concluida: progresso >= parseInt(conquista.criterio),
          dataConquista: progresso >= parseInt(conquista.criterio) ? new Date() : null
        }
      })

      // Se completou a conquista e ainda não foi marcada como concluída
      if (progresso >= parseInt(conquista.criterio) && !progressoUsuario.concluida) {
        // Adicionar XP como recompensa
        if (conquista.recompensaXp > 0) {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/usuario/xp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              xpGanho: conquista.recompensaXp,
              fonte: 'conquista',
              descricao: `Conquista: ${conquista.titulo}`
            })
          })
        }
      }

      return res.status(200).json({
        success: true,
        progresso: progressoAtualizado
      })

    } catch (error) {
      console.error('Erro ao atualizar progresso da conquista:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    return res.status(405).json({ error: 'Método não permitido' })
  }
} 