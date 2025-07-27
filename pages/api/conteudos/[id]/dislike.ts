import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { id } = req.query
    const { userId } = req.body

    if (!id) {
      return res.status(400).json({ error: 'ID do conteúdo é obrigatório' })
    }

    if (!userId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }

    // Verificar se o usuário já deu dislike
    const dislikeExistente = await prisma.interacaoConteudo.findUnique({
      where: {
        conteudoId_usuarioId_tipo: {
          conteudoId: String(id),
          usuarioId: userId,
          tipo: 'dislike'
        }
      }
    })

    let disliked = false
    let conteudo

    if (dislikeExistente) {
      // Remover dislike
      await prisma.interacaoConteudo.delete({
        where: {
          conteudoId_usuarioId_tipo: {
            conteudoId: String(id),
            usuarioId: userId,
            tipo: 'dislike'
          }
        }
      })

      // Decrementar dislikes
      conteudo = await prisma.conteudo.update({
        where: { id: String(id) },
        data: {
          dislikes: {
            decrement: 1
          }
        }
      })
    } else {
      // Adicionar dislike
      await prisma.interacaoConteudo.create({
        data: {
          conteudoId: String(id),
          usuarioId: userId,
          tipo: 'dislike'
        }
      })

      disliked = true

      // Incrementar dislikes
      conteudo = await prisma.conteudo.update({
        where: { id: String(id) },
        data: {
          dislikes: {
            increment: 1
          }
        }
      })
    }

    return res.status(200).json({
      disliked,
      dislikes: conteudo.dislikes
    })

  } catch (error) {
    console.error('Erro ao processar dislike:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 