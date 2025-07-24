import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

const getUserFromToken = (req: NextApiRequest) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return null
  const token = authHeader.split(' ')[1]
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'sementesplay_secret') as { id: string }
  } catch {
    return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const user = getUserFromToken(req)
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }
      const { usuario1Id, usuario2Id } = req.body
      if (!usuario1Id || !usuario2Id) {
        return res.status(400).json({ error: 'IDs dos usuários são obrigatórios' })
      }
      // Verificar se já existe conversa
      let conversa = await prisma.conversa.findFirst({
        where: {
          OR: [
            { usuario1Id: usuario1Id, usuario2Id: usuario2Id },
            { usuario1Id: usuario2Id, usuario2Id: usuario1Id }
          ]
        }
      })
      if (!conversa) {
        conversa = await prisma.conversa.create({
          data: {
            usuario1Id: usuario1Id,
            usuario2Id: usuario2Id,
            dataCriacao: new Date()
          }
        })
      }
      return res.status(201).json({ id: conversa.id })
    } catch (error) {
      console.error('Erro ao criar conversa:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const user = getUserFromToken(req)
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    const { usuarioId } = req.query

    if (!usuarioId || usuarioId !== user.id) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    // Buscar todos os amigos aceitos
    const amizades = await prisma.amizade.findMany({
      where: {
        OR: [
          { usuarioId: String(usuarioId), status: 'aceita' },
          { amigoId: String(usuarioId), status: 'aceita' }
        ]
      },
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        amigo: { select: { id: true, nome: true, email: true } }
      }
    })

    // Para cada amigo, buscar conversa (se existir) e última mensagem
    const conversas = await Promise.all(amizades.map(async amizade => {
      const amigo = amizade.usuarioId === usuarioId ? amizade.amigo : amizade.usuario
      // Buscar conversa (pode ser em qualquer direção)
      const conversa = await prisma.conversa.findFirst({
        where: {
          OR: [
            { usuario1Id: String(usuarioId), usuario2Id: amigo.id },
            { usuario1Id: amigo.id, usuario2Id: String(usuarioId) }
          ]
        },
        include: {
          mensagens: {
            orderBy: { dataEnvio: 'desc' },
            take: 1
          }
        }
      })
      const ultimaMensagem = conversa?.mensagens[0]
      return {
        id: conversa?.id || null,
        usuarioId: amigo.id,
        usuarioNome: amigo.nome,
        usuarioEmail: amigo.email,
        ultimaMensagem: ultimaMensagem?.texto || 'Nenhuma mensagem',
        ultimaAtividade: ultimaMensagem?.dataEnvio || null,
        naoLidas: 0 // Por enquanto
      }
    }))

    return res.status(200).json({ conversas })
  } catch (error) {
    console.error('Erro ao buscar conversas:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 