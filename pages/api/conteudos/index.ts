import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { criadorId } = req.query
      
      // Construir filtros
      const where: any = {}
      if (criadorId) {
        where.criadorId = String(criadorId)
      }
      
      // Buscar conteúdos
      const conteudos = await prisma.conteudo.findMany({
        where,
        include: {
          criador: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nome: true,
                  email: true
                }
              }
            }
          },
          comentarios: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nome: true
                }
              }
            },
            orderBy: {
              data: 'desc'
            },
            take: 5
          }
        },
        orderBy: {
          dataPublicacao: 'desc'
        }
      })

      const conteudosFormatados = conteudos.map(conteudo => ({
        id: conteudo.id,
        titulo: conteudo.titulo,
        descricao: conteudo.descricao,
        tipo: conteudo.tipo,
        url: conteudo.url,
        thumbnail: conteudo.preview || '/thumbnails/default.jpg',
        visualizacoes: conteudo.visualizacoes,
        likes: conteudo.curtidas,
        dataCriacao: conteudo.dataPublicacao,
        criador: {
          id: conteudo.criador.usuario.id,
          nome: conteudo.criador.usuario.nome,
          email: conteudo.criador.usuario.email
        },
        comentarios: conteudo.comentarios.map(comentario => ({
          id: comentario.id,
          texto: comentario.texto,
          usuario: comentario.usuario.nome,
          dataCriacao: comentario.data
        })),
        tags: [], // Mockado por enquanto
        categoria: conteudo.categoria
      }))

      return res.status(200).json({ conteudos: conteudosFormatados })
    } catch (error) {
      console.error('Erro ao buscar conteúdos:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { criadorId, titulo, url, tipo, categoria, descricao, plataforma } = req.body;
      if (!criadorId || !titulo || !url || !tipo || !categoria) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
      }
      const novo = await prisma.conteudo.create({
        data: {
          criadorId,
          titulo,
          url,
          tipo,
          categoria,
          descricao: descricao || '',
          plataforma: plataforma || '',
        }
      });
      return res.status(201).json(novo);
    } catch (error) {
      console.error('Erro ao criar conteúdo:', error);
      return res.status(500).json({ error: 'Erro ao criar conteúdo' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, criadorId, titulo, url, tipo, categoria, descricao, plataforma } = req.body;
      if (!id) return res.status(400).json({ error: 'ID obrigatório' });
      const atualizado = await prisma.conteudo.update({
        where: { id },
        data: {
          criadorId,
          titulo,
          url,
          tipo,
          categoria,
          descricao,
          plataforma,
        }
      });
      return res.status(200).json(atualizado);
    } catch (error) {
      console.error('Erro ao atualizar conteúdo:', error);
      return res.status(500).json({ error: 'Erro ao atualizar conteúdo' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'ID obrigatório' });
      await prisma.conteudo.delete({ where: { id } });
      return res.status(204).end();
    } catch (error) {
      console.error('Erro ao remover conteúdo:', error);
      return res.status(500).json({ error: 'Erro ao remover conteúdo' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 