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

      // Buscar conquistas do usuário
      const conquistasUsuario = await prisma.conquistaUsuario.findMany({
        where: {
          usuarioId: String(usuarioId)
        },
        include: {
          conquista: true
        },
        orderBy: {
          dataConquista: 'desc'
        }
      })

      const conquistasFormatadas = conquistasUsuario.map(cu => ({
        id: cu.conquista.id,
        nome: cu.conquista.titulo,
        descricao: cu.conquista.descricao,
        icone: cu.conquista.icone,
        cor: 'blue', // Mockado por enquanto
        nivel: 1, // Mockado por enquanto
        maxNivel: 1, // Mockado por enquanto
        desbloqueada: true,
        dataConquista: cu.dataConquista
      }))

      // Buscar todas as conquistas disponíveis para mostrar as não desbloqueadas
      const todasConquistas = await prisma.conquista.findMany({
        where: {
          ativa: true
        },
        orderBy: {
          titulo: 'asc'
        }
      })

      const conquistasNaoDesbloqueadas = todasConquistas
        .filter(conquista => !conquistasFormatadas.find(c => c.id === conquista.id))
        .map(conquista => ({
          id: conquista.id,
          nome: conquista.titulo,
          descricao: conquista.descricao,
          icone: conquista.icone,
          cor: 'gray', // Mockado por enquanto
          nivel: 0,
          maxNivel: 1, // Mockado por enquanto
          desbloqueada: false,
          dataConquista: null
        }))

      const todasConquistasFormatadas = [...conquistasFormatadas, ...conquistasNaoDesbloqueadas]

      return res.status(200).json({ conquistas: todasConquistasFormatadas })
    } catch (error) {
      console.error('Erro ao buscar conquistas:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 