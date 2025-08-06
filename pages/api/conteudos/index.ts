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

      const getYoutubeId = (url: string) => {
        const match = url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/|shorts\/)?)([\w-]{11})/)
        return match ? match[1] : null
      }

      const conteudosFormatados = conteudos.map(conteudo => {
        let thumbnail = conteudo.preview || null
        if (!thumbnail && conteudo.url && conteudo.tipo === 'video' && conteudo.url.includes('youtube')) {
          const ytId = getYoutubeId(conteudo.url)
          if (ytId) {
            thumbnail = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
          }
        }
        return {
          id: conteudo.id,
          titulo: conteudo.titulo || '',
          url: conteudo.url || '',
          tipo: conteudo.tipo || '',
          categoria: conteudo.categoria || '',
          data: conteudo.dataPublicacao ? conteudo.dataPublicacao.toISOString() : new Date().toISOString(),
          visualizacoes: conteudo.visualizacoes || 0,
          curtidas: conteudo.curtidas || 0,
          dislikes: (conteudo as any).dislikes || 0,
          compartilhamentos: (conteudo as any).compartilhamentos || 0,
          comentarios: conteudo.comentarios ? conteudo.comentarios.length : 0,
          thumbnail: thumbnail || '/thumbnails/default.jpg'
        }
      })

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
      
      // Buscar informações do criador para o log
      const criador = await prisma.criador.findUnique({
        where: { id: criadorId },
        include: { usuario: true }
      });

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

      // Log de auditoria
      await prisma.logAuditoria.create({
        data: {
          usuarioId: criador?.usuarioId || 'system',
          acao: 'CRIAR_CONTEUDO',
          detalhes: `Conteúdo criado. ID: ${novo.id}, Título: ${titulo}, Tipo: ${tipo}, Categoria: ${categoria}, Criador: ${criador?.usuario?.nome || criadorId}`,
          ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
          nivel: 'info'
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
      
      // Buscar conteúdo atual para comparar
      const conteudoAtual = await prisma.conteudo.findUnique({
        where: { id },
        include: { criador: { include: { usuario: true } } }
      });

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

      // Log de auditoria
      await prisma.logAuditoria.create({
        data: {
          usuarioId: conteudoAtual?.criador?.usuarioId || 'system',
          acao: 'EDITAR_CONTEUDO',
          detalhes: `Conteúdo editado. ID: ${id}, Título: ${titulo}, Tipo: ${tipo}, Categoria: ${categoria}, Criador: ${conteudoAtual?.criador?.usuario?.nome || criadorId}`,
          ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
          nivel: 'info'
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
      
      // Buscar conteúdo antes de deletar para o log
      const conteudo = await prisma.conteudo.findUnique({
        where: { id },
        include: { criador: { include: { usuario: true } } }
      });

      await prisma.conteudo.delete({ where: { id } });

      // Log de auditoria
      await prisma.logAuditoria.create({
        data: {
          usuarioId: conteudo?.criador?.usuarioId || 'system',
          acao: 'DELETAR_CONTEUDO',
          detalhes: `Conteúdo deletado. ID: ${id}, Título: ${conteudo?.titulo || 'N/A'}, Criador: ${conteudo?.criador?.usuario?.nome || 'N/A'}`,
          ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
          nivel: 'warning'
        }
      });

      return res.status(204).end();
    } catch (error) {
      console.error('Erro ao remover conteúdo:', error);
      return res.status(500).json({ error: 'Erro ao remover conteúdo' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 