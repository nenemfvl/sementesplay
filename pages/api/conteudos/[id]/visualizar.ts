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

      // Incrementar visualizações
      const conteudo = await prisma.conteudo.update({
        where: { id: String(id) },
        data: {
          visualizacoes: {
            increment: 1
          }
        }
      })

      // Registrar visualização do usuário (se autenticado)
      if (userId) {
        try {
          await prisma.interacaoConteudo.upsert({
            where: {
              conteudoId_usuarioId_tipo: {
                conteudoId: String(id),
                usuarioId: userId,
                tipo: 'visualizacao'
              }
            },
            update: {
              data: new Date()
            },
            create: {
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
        visualizacoes: conteudo.visualizacoes 
      })
    } catch (error) {
      console.error('Erro ao registrar visualização:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 