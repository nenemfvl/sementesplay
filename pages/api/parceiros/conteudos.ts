import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { parceiroId, categoria } = req.query
      
      // Construir filtros
      const where: any = {}
      if (parceiroId) {
        where.parceiroId = String(parceiroId)
      }
      if (categoria && categoria !== 'geral') {
        where.categoria = String(categoria)
      }
      
      // Buscar conteúdos de parceiros
      const conteudos = await prisma.conteudoParceiro.findMany({
        where,
        include: {
          parceiro: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nome: true,
                  email: true,
                  avatarUrl: true
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
        if (!thumbnail && conteudo.url && conteudo.url.includes('youtube')) {
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
          descricao: conteudo.descricao || '',
          plataforma: conteudo.plataforma || '',
          data: conteudo.dataPublicacao ? conteudo.dataPublicacao.toISOString() : new Date().toISOString(),
          visualizacoes: conteudo.visualizacoes || 0,
          curtidas: conteudo.curtidas || 0,
          dislikes: conteudo.dislikes || 0,
          compartilhamentos: conteudo.compartilhamentos || 0,
          comentarios: conteudo.comentarios ? conteudo.comentarios.length : 0,
          thumbnail: thumbnail || '/thumbnails/default.jpg',
          cidade: conteudo.cidade || '',
          endereco: conteudo.endereco || '',
          dataEvento: conteudo.dataEvento ? conteudo.dataEvento.toISOString() : null,
          preco: conteudo.preco || '',
          vagas: conteudo.vagas || null,
          parceiro: {
            id: conteudo.parceiro.id,
            nome: conteudo.parceiro.usuario.nome,
            avatar: conteudo.parceiro.usuario.avatarUrl || '🏢',
            nomeCidade: conteudo.parceiro.nomeCidade
          }
        }
      })

      return res.status(200).json({ 
        success: true,
        conteudos: conteudosFormatados 
      })
    } catch (error) {
      console.error('Erro ao buscar conteúdos de parceiros:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { parceiroId, titulo, url, tipo, categoria, descricao, plataforma, cidade, endereco, dataEvento, preco, vagas } = req.body;
      
      if (!parceiroId || !titulo || !url || !tipo || !categoria || !cidade) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
      }

      const novo = await prisma.conteudoParceiro.create({
        data: {
          parceiroId,
          titulo,
          url,
          tipo,
          categoria,
          descricao: descricao || '',
          plataforma: plataforma || '',
          cidade,
          endereco: endereco || '',
          dataEvento: dataEvento ? new Date(dataEvento) : null,
          preco: preco || '',
          vagas: vagas ? parseInt(vagas) : null,
        }
      });
      
      return res.status(201).json({ success: true, conteudo: novo });
    } catch (error) {
      console.error('Erro ao criar conteúdo de parceiro:', error);
      return res.status(500).json({ error: 'Erro ao criar conteúdo' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, parceiroId, titulo, url, tipo, categoria, descricao, plataforma, cidade, endereco, dataEvento, preco, vagas } = req.body;
      
      if (!id) return res.status(400).json({ error: 'ID obrigatório' });
      
      const atualizado = await prisma.conteudoParceiro.update({
        where: { id },
        data: {
          parceiroId,
          titulo,
          url,
          tipo,
          categoria,
          descricao,
          plataforma,
          cidade,
          endereco,
          dataEvento: dataEvento ? new Date(dataEvento) : null,
          preco,
          vagas: vagas ? parseInt(vagas) : null,
        }
      });
      
      return res.status(200).json({ success: true, conteudo: atualizado });
    } catch (error) {
      console.error('Erro ao atualizar conteúdo de parceiro:', error);
      return res.status(500).json({ error: 'Erro ao atualizar conteúdo' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'ID obrigatório' });
      
      await prisma.conteudoParceiro.delete({ where: { id } });
      return res.status(204).end();
    } catch (error) {
      console.error('Erro ao remover conteúdo de parceiro:', error);
      return res.status(500).json({ error: 'Erro ao remover conteúdo' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 