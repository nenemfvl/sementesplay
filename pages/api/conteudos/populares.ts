import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { limit = 5 } = req.query

    // Buscar conteúdos dos parceiros ordenados por visualizações (excluindo os removidos)
    const conteudosPopulares = await prisma.conteudoParceiro.findMany({
      where: {
        removido: false
      },
      include: {
        parceiro: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true
              }
            }
          }
        }
      },
      orderBy: {
        visualizacoes: 'desc'
      },
      take: Number(limit)
    })

    // Formatar os dados
    const conteudosFormatados = conteudosPopulares.map(conteudo => ({
      id: conteudo.id,
      titulo: conteudo.titulo,
      tipo: conteudo.tipo,
      categoria: conteudo.categoria,
      url: conteudo.url,
      visualizacoes: conteudo.visualizacoes,
      curtidas: conteudo.curtidas,
      dislikes: conteudo.dislikes,
      dataPublicacao: conteudo.dataPublicacao,
      parceiro: {
        id: conteudo.parceiro.id,
        nome: conteudo.parceiro.usuario.nome,
        nomeCidade: conteudo.parceiro.nomeCidade
      }
    }))

    res.status(200).json({
      success: true,
      conteudos: conteudosFormatados
    })
  } catch (error) {
    console.error('Erro ao buscar conteúdos populares:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 