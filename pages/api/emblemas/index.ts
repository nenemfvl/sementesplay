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

      // Buscar emblemas do usuário
      const emblemasUsuario = await prisma.emblemaUsuario.findMany({
        where: {
          usuarioId: String(usuarioId)
        },
        orderBy: {
          dataConquista: 'desc'
        }
      })

      const emblemasFormatados = emblemasUsuario.map(emblema => ({
        id: emblema.id,
        nome: emblema.titulo,
        descricao: `Emblema conquistado: ${emblema.titulo}`,
        icone: emblema.emblema,
        cor: 'purple',
        desbloqueada: true,
        nivel: 1,
        maxNivel: 1,
        dataConquista: emblema.dataConquista
      }))

      return res.status(200).json({ emblemas: emblemasFormatados })
    } catch (error) {
      console.error('Erro ao buscar emblemas:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 