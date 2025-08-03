import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { limit = 10 } = req.query

    // Buscar conteúdos mais recentes dos criadores
    const conteudos = await prisma.conteudo.findMany({
      include: {
        criador: {
          include: {
            usuario: {
              select: {
                nome: true,
                avatarUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        dataPublicacao: 'desc'
      },
      take: parseInt(limit as string) || 10
    })

    // Formatar os conteúdos para o formato de notícias
    const noticias = conteudos.map((conteudo, index) => ({
      id: conteudo.id,
      titulo: conteudo.titulo,
      descricao: conteudo.descricao || `Novo conteúdo de ${conteudo.criador.usuario.nome}`,
      data: conteudo.dataPublicacao?.toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR'),
      link: `/criador/${conteudo.criador.id}`,
      tipo: conteudo.tipo,
      url: conteudo.url,
      criador: {
        nome: conteudo.criador.usuario.nome,
        avatarUrl: conteudo.criador.usuario.avatarUrl
      },
      categoria: conteudo.categoria
    }))

    return res.status(200).json({
      noticias,
      total: noticias.length
    })
  } catch (error) {
    console.error('Erro ao buscar conteúdos recentes:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 