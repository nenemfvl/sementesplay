import { prisma } from '../../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { id } = req.query
      const { userId } = req.body

      if (!id || !userId) {
        return res.status(400).json({ error: 'ID do conteúdo e usuário são obrigatórios' })
      }

      // Primeiro, verificar se é um conteúdo normal ou de parceiro
      let conteudo = await prisma.conteudo.findUnique({
        where: { id: String(id) }
      })

      let conteudoParceiro = null
      if (!conteudo) {
        conteudoParceiro = await prisma.conteudoParceiro.findUnique({
          where: { id: String(id) }
        })
      }

      if (!conteudo && !conteudoParceiro) {
        return res.status(404).json({ error: 'Conteúdo não encontrado' })
      }

      const isConteudoParceiro = !!conteudoParceiro
      const tabelaInteracao = isConteudoParceiro ? 'interacaoConteudoParceiro' : 'interacaoConteudo'

      // Verificar se o usuário já deu dislike neste conteúdo
      const dislikeExistente = await (prisma as any)[tabelaInteracao].findFirst({
        where: {
          conteudoId: String(id),
          usuarioId: userId,
          tipo: 'dislike'
        }
      })

      if (dislikeExistente) {
        // Se já deu dislike, remove o dislike
        await prisma.$transaction([
          (prisma as any)[tabelaInteracao].delete({
            where: {
              id: dislikeExistente.id
            }
          }),
          isConteudoParceiro 
            ? prisma.conteudoParceiro.update({
                where: { id: String(id) },
                data: { dislikes: { decrement: 1 } }
              })
            : prisma.conteudo.update({
                where: { id: String(id) },
                data: { dislikes: { decrement: 1 } }
              })
        ])

        const conteudoAtualizado = isConteudoParceiro 
          ? await prisma.conteudoParceiro.findUnique({ where: { id: String(id) } })
          : await prisma.conteudo.findUnique({ where: { id: String(id) } })

        return res.status(200).json({ 
          success: true, 
          dislikes: conteudoAtualizado?.dislikes || 0,
          disliked: false
        })
      } else {
        // Se não deu dislike, adiciona o dislike
        await prisma.$transaction([
          (prisma as any)[tabelaInteracao].create({
            data: {
              conteudoId: String(id),
              usuarioId: userId,
              tipo: 'dislike'
            }
          }),
          isConteudoParceiro 
            ? prisma.conteudoParceiro.update({
                where: { id: String(id) },
                data: { dislikes: { increment: 1 } }
              })
            : prisma.conteudo.update({
                where: { id: String(id) },
                data: { dislikes: { increment: 1 } }
              })
        ])

        const conteudoAtualizado = isConteudoParceiro 
          ? await prisma.conteudoParceiro.findUnique({ where: { id: String(id) } })
          : await prisma.conteudo.findUnique({ where: { id: String(id) } })

        return res.status(200).json({ 
          success: true, 
          dislikes: conteudoAtualizado?.dislikes || 0,
          disliked: true
        })
      }
    } catch (error) {
      console.error('Erro ao dar/remover dislike:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 