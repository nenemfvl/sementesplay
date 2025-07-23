import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { usuarioId } = req.query

      // Buscar conquistas ativas
      const conquistas = await prisma.Conquista.findMany({
        where: { ativa: true },
        include: {
          usuarios: {
            where: { usuarioId: usuarioId ? String(usuarioId) : undefined }
          }
        },
        orderBy: { id: 'asc' }
      })

      // Formatar conquistas com status do usuário
      const conquistasFormatadas = conquistas.map(conquista => {
        const conquistaUsuario = conquista.usuarios[0]

        return {
          id: conquista.id,
          titulo: conquista.titulo,
          descricao: conquista.descricao,
          icone: conquista.icone,
          criterio: conquista.criterio,
          ativa: conquista.ativa,
          desbloqueada: !!conquistaUsuario,
          dataConquista: conquistaUsuario?.dataConquista || null
        }
      })

      return res.status(200).json(conquistasFormatadas)
    } catch (error) {
      console.error('Erro ao buscar conquistas:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { titulo, descricao, icone, criterio } = req.body

      if (!titulo || !descricao || !icone || !criterio) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
      }

      // Criar nova conquista
      const novaConquista = await prisma.Conquista.create({
        data: {
          titulo: String(titulo),
          descricao: String(descricao),
          icone: String(icone),
          criterio: String(criterio),
          ativa: true
        }
      })

      return res.status(201).json(novaConquista)
    } catch (error) {
      console.error('Erro ao criar conquista:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 