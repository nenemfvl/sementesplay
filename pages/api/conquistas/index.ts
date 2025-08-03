import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { auth } from '../../../lib/auth'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { usuarioId } = req.query

      if (!usuarioId) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório' })
      }

      // Buscar conquistas do usuário
      const conquistasUsuario = await prisma.conquistaUsuario.findMany({
        where: {
          usuarioId: String(usuarioId)
        },
        include: {
          conquista: true
        },
        orderBy: {
          dataConquista: 'desc'
        }
      })

      // Buscar todas as conquistas disponíveis
      const todasConquistas = await prisma.conquista.findMany({
        where: {
          ativa: true
        }
      })

      // Combinar conquistas do usuário com todas as conquistas
      const conquistasCompletas = todasConquistas.map(conquista => {
        const conquistaUsuario = conquistasUsuario.find(cu => cu.conquistaId === conquista.id)
        
        return {
          id: conquista.id,
          titulo: conquista.titulo,
          descricao: conquista.descricao,
          icone: conquista.icone || '🏆',
          cor: 'yellow',
          raridade: 'comum',
          desbloqueada: !!conquistaUsuario,
          concluida: !!conquistaUsuario,
          dataConquista: conquistaUsuario?.dataConquista,
          criterio: conquista.criterio,
          recompensaXp: conquista.recompensaXp
        }
      })

      return res.status(200).json({ conquistas: conquistasCompletas })
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