import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { id: conversaId } = req.query

    if (!conversaId) {
      return res.status(400).json({ error: 'ID da conversa é obrigatório' })
    }

    // Buscar mensagens da conversa
    const mensagens = await prisma.mensagem.findMany({
      where: {
        conversaId: String(conversaId)
      },
      include: {
        remetente: {
          select: {
            id: true,
            nome: true
          }
        }
      },
      orderBy: {
        dataEnvio: 'asc'
      }
    })

    const mensagensFormatadas = mensagens.map(mensagem => ({
      id: mensagem.id,
      remetenteId: mensagem.remetenteId,
      remetenteNome: mensagem.remetente.nome,
      conteudo: mensagem.texto,
      timestamp: mensagem.dataEnvio,
      tipo: 'texto',
      lida: mensagem.lida
    }))

    return res.status(200).json({ mensagens: mensagensFormatadas })
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 