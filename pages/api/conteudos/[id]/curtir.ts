import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

      // Verificar se o usuário já curtiu este conteúdo
      const curtidaExistente = await (prisma as any)[tabelaInteracao].findFirst({
        where: {
          conteudoId: String(id),
          usuarioId: userId,
          tipo: 'curtida'
        }
      })

      if (curtidaExistente) {
        // Se já curtiu, remove a curtida
        await prisma.$transaction([
          (prisma as any)[tabelaInteracao].delete({
            where: {
              id: curtidaExistente.id
            }
          }),
          isConteudoParceiro 
            ? prisma.conteudoParceiro.update({
                where: { id: String(id) },
                data: { curtidas: { decrement: 1 } }
              })
            : prisma.conteudo.update({
                where: { id: String(id) },
                data: { curtidas: { decrement: 1 } }
              })
        ])

        const conteudoAtualizado = isConteudoParceiro 
          ? await prisma.conteudoParceiro.findUnique({ where: { id: String(id) } })
          : await prisma.conteudo.findUnique({ where: { id: String(id) } })

        return res.status(200).json({ 
          success: true, 
          curtidas: conteudoAtualizado?.curtidas || 0,
          curtido: false
        })
      } else {
        // Se não curtiu, adiciona a curtida
        await prisma.$transaction([
          (prisma as any)[tabelaInteracao].create({
            data: {
              conteudoId: String(id),
              usuarioId: userId,
              tipo: 'curtida'
            }
          }),
          isConteudoParceiro 
            ? prisma.conteudoParceiro.update({
                where: { id: String(id) },
                data: { curtidas: { increment: 1 } }
              })
            : prisma.conteudo.update({
                where: { id: String(id) },
                data: { curtidas: { increment: 1 } }
              })
        ])

        const conteudoAtualizado = isConteudoParceiro 
          ? await prisma.conteudoParceiro.findUnique({ where: { id: String(id) } })
          : await prisma.conteudo.findUnique({ where: { id: String(id) } })

        return res.status(200).json({ 
          success: true, 
          curtidas: conteudoAtualizado?.curtidas || 0,
          curtido: true
        })
      }
    } catch (error) {
      console.error('Erro ao curtir/descurtir:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 