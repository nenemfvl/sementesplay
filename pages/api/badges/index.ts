import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { usuarioId } = req.query

    if (!usuarioId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' })
    }

    // Buscar conquistas do usuário (que funcionam como badges)
    const conquistasUsuario = await prisma.conquistaUsuario.findMany({
      where: {
        usuarioId: String(usuarioId)
      },
      include: {
        conquista: true
      }
    })

    // Buscar todas as conquistas disponíveis
    const todasConquistas = await prisma.conquista.findMany({
      where: {
        ativa: true
      }
    })

    const badges = todasConquistas.map(conquista => {
      const conquistaUsuario = conquistasUsuario.find(cu => cu.conquistaId === conquista.id)
      
      return {
        id: conquista.id,
        nome: conquista.titulo,
        descricao: conquista.descricao,
        icone: conquista.icone,
        cor: conquistaUsuario ? 'blue' : 'gray',
        desbloqueada: !!conquistaUsuario,
        nivel: conquistaUsuario ? 1 : 0,
        maxNivel: 1
      }
    })

    return res.status(200).json({ badges })
  } catch (error) {
    console.error('Erro ao buscar badges:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 