import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { id } = req.query
      const { userId } = req.body

      if (!id) {
        return res.status(400).json({ error: 'ID do conteúdo é obrigatório' })
      }

      // Verificar se o usuário já visualizou este conteúdo
      let jaVisualizou = false
      if (userId) {
        try {
          const visualizacaoExistente = await (prisma as any).interacaoConteudo.findUnique({
            where: {
              conteudoId_usuarioId_tipo: {
                conteudoId: String(id),
                usuarioId: userId,
                tipo: 'visualizacao'
              }
            }
          })
          jaVisualizou = !!visualizacaoExistente
        } catch (error) {
          console.error('Erro ao verificar visualização existente:', error)
        }
      }

      // Só incrementar visualizações se o usuário ainda não visualizou
      let conteudo
      if (!jaVisualizou) {
        conteudo = await prisma.conteudo.update({
          where: { id: String(id) },
          data: {
            visualizacoes: {
              increment: 1
            }
          }
        })
      } else {
        // Buscar o conteúdo sem incrementar
        conteudo = await prisma.conteudo.findUnique({
          where: { id: String(id) }
        })
      }

      // Registrar visualização do usuário (se autenticado e ainda não visualizou)
      if (userId && !jaVisualizou) {
        try {
          await (prisma as any).interacaoConteudo.create({
            data: {
              conteudoId: String(id),
              usuarioId: userId,
              tipo: 'visualizacao'
            }
          })
        } catch (error) {
          console.error('Erro ao registrar visualização do usuário:', error)
          // Não falha se não conseguir registrar a visualização do usuário
        }
      }

      return res.status(200).json({ 
        success: true, 
        visualizacoes: conteudo?.visualizacoes || 0
      })
    } catch (error) {
      console.error('Erro ao registrar visualização:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 