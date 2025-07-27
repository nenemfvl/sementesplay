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

    // Registrar compartilhamento
    await prisma.interacaoConteudo.create({
      data: {
        conteudoId: String(id),
        usuarioId: userId,
        tipo: 'compartilhamento'
      }
    })

    // Incrementar compartilhamentos
    const conteudo = await prisma.conteudo.update({
      where: { id: String(id) },
      data: {
        compartilhamentos: {
          increment: 1
        }
      }
    })

    return res.status(200).json({
      compartilhamentos: conteudo.compartilhamentos
    })

  } catch (error) {
    console.error('Erro ao registrar compartilhamento:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 