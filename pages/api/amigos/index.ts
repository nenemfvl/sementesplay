import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { usuarioId } = req.query

      if (!usuarioId) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório' })
      }

      // Buscar amizades aceitas do usuário
      const amizades = await prisma.amizade.findMany({
        where: {
          OR: [
            { usuarioId: String(usuarioId), status: 'aceita' },
            { amigoId: String(usuarioId), status: 'aceita' }
          ]
        },
        include: {
          usuario: true,
          amigo: true
        }
      })

      // Formatar lista de amigos
      const amigos = amizades.map(amizade => {
        const amigo = amizade.usuarioId === usuarioId ? amizade.amigo : amizade.usuario
        const mutual = true // Se está na lista, é mutual

        return {
          id: amigo.id,
          nome: amigo.nome,
          email: amigo.email,
          nivel: amigo.nivel,
          sementes: amigo.sementes,
          status: 'online' as const, // Mockado por enquanto
          ultimaAtividade: new Date(),
          mutual
        }
      })

      return res.status(200).json({ amigos })
    } catch (error) {
      console.error('Erro ao buscar amigos:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { usuarioId, amigoId } = req.body

      if (!usuarioId || !amigoId) {
        return res.status(400).json({ error: 'IDs do usuário e amigo são obrigatórios' })
      }

      if (usuarioId === amigoId) {
        return res.status(400).json({ error: 'Não é possível adicionar a si mesmo como amigo' })
      }

      // Verificar se já existe amizade
      const amizadeExistente = await prisma.amizade.findFirst({
        where: {
          OR: [
            { usuarioId: String(usuarioId), amigoId: String(amigoId) },
            { usuarioId: String(amigoId), amigoId: String(usuarioId) }
          ]
        }
      })

      if (amizadeExistente) {
        return res.status(400).json({ error: 'Amizade já existe' })
      }

      // Criar solicitação de amizade
      const novaAmizade = await prisma.amizade.create({
        data: {
          usuarioId: String(usuarioId),
          amigoId: String(amigoId),
          status: 'pendente'
        }
      })

      return res.status(201).json(novaAmizade)
    } catch (error) {
      console.error('Erro ao adicionar amigo:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 