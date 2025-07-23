import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { usuarioId } = req.query

    if (!usuarioId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }

    // Buscar conversas do usuário
    const conversas = await prisma.conversa.findMany({
      where: {
        OR: [
          { usuario1Id: String(usuarioId) },
          { usuario2Id: String(usuarioId) }
        ]
      },
      include: {
        usuario1: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        usuario2: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        },
        mensagens: {
          orderBy: {
            dataEnvio: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        ultimaMensagem: 'desc'
      }
    })

    const conversasFormatadas = conversas.map(conversa => {
      const outroUsuario = conversa.usuario1Id === usuarioId ? conversa.usuario2 : conversa.usuario1
      const ultimaMensagem = conversa.mensagens[0]

      return {
        id: conversa.id,
        usuarioId: outroUsuario.id,
        usuarioNome: outroUsuario.nome,
        usuarioEmail: outroUsuario.email,
        ultimaMensagem: ultimaMensagem?.texto || 'Nenhuma mensagem',
        ultimaAtividade: ultimaMensagem?.dataEnvio || conversa.dataCriacao,
        naoLidas: 0 // Por enquanto
      }
    })

    return res.status(200).json({ conversas: conversasFormatadas })
  } catch (error) {
    console.error('Erro ao buscar conversas:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 