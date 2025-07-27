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
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    // Buscar usuário pelo token
    const usuario = await prisma.usuario.findUnique({
      where: { id: token }
    })

    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' })
    }

    // Verificar se já existe interação de dislike
    const interacaoExistente = await prisma.interacaoConteudo.findUnique({
      where: {
        conteudoId_usuarioId_tipo: {
          conteudoId: id as string,
          usuarioId: usuario.id,
          tipo: 'dislike'
        }
      }
    })

    if (interacaoExistente) {
      return res.status(200).json({ 
        message: 'Dislike já registrado',
        dislikes: 0 
      })
    }

    // Criar interação e incrementar dislikes em uma transação
    const resultado = await prisma.$transaction(async (tx) => {
      // Criar interação
      await tx.interacaoConteudo.create({
        data: {
          conteudoId: id as string,
          usuarioId: usuario.id,
          tipo: 'dislike',
          data: new Date()
        }
      })

      // Incrementar dislikes no conteúdo
      const conteudoAtualizado = await tx.conteudo.update({
        where: { id: id as string },
        data: {
          dislikes: {
            increment: 1
          }
        }
      })

      return conteudoAtualizado
    })

    res.status(200).json({ 
      message: 'Dislike registrado com sucesso',
      dislikes: resultado.dislikes 
    })

  } catch (error) {
    console.error('Erro ao registrar dislike:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 