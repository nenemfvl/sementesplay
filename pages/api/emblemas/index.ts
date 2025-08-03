import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { auth } from '../../../lib/auth'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const user = auth.getUser()
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      // Buscar emblemas do usuário
      const emblemasUsuario = await prisma.emblemaUsuario.findMany({
        where: { usuarioId: user.id },
        orderBy: { dataConquista: 'desc' }
      })

      return res.status(200).json({
        emblemas: emblemasUsuario
      })

    } catch (error) {
      console.error('Erro ao buscar emblemas:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else if (req.method === 'POST') {
    try {
      const user = auth.getUser()
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      const { emblema, titulo } = req.body

      if (!emblema || !titulo) {
        return res.status(400).json({ error: 'Dados incompletos' })
      }

      // Verificar se o usuário já tem este emblema
      const emblemaExistente = await prisma.emblemaUsuario.findFirst({
        where: {
          usuarioId: user.id,
          emblema
        }
      })

      if (emblemaExistente) {
        return res.status(400).json({ error: 'Usuário já possui este emblema' })
      }

      // Adicionar emblema ao usuário
      const novoEmblema = await prisma.emblemaUsuario.create({
        data: {
          usuarioId: user.id,
          emblema,
          titulo
        }
      })

      return res.status(200).json({
        success: true,
        emblema: novoEmblema
      })

    } catch (error) {
      console.error('Erro ao adicionar emblema:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    return res.status(405).json({ error: 'Método não permitido' })
  }
} 