import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { parceiroId, categoria } = req.query
      
      // Construir filtros
      const where: any = {
        removido: false // Filtrar apenas conteúdos não removidos
      }
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
          preview: conteudo.preview || null, // Campo para imagem personalizada
          thumbnail: thumbnail || '/thumbnails/default.jpg', // Mantido para compatibilidade
          cidade: conteudo.cidade || '',
          endereco: conteudo.endereco || '',
          dataEvento: conteudo.dataEvento ? conteudo.dataEvento.toISOString() : null,
          preco: conteudo.preco || '',
          vagas: conteudo.vagas || null,
          fixado: conteudo.fixado || false,
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
      
      if (!parceiroId || !url || !categoria || !cidade) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
      }

      // Detectar tipo automaticamente pela URL se não fornecido
      let tipoDetectado = tipo || 'conteudo'; // Padrão genérico
      
      if (!tipo && url) {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          tipoDetectado = 'youtube';
        } else if (url.includes('tiktok.com')) {
          tipoDetectado = 'tiktok';
        } else if (url.includes('instagram.com')) {
          tipoDetectado = 'instagram';
        } else if (url.includes('twitch.tv')) {
          tipoDetectado = 'twitch';
        }
      }

      const novo = await prisma.conteudoParceiro.create({
        data: {
          parceiroId,
          titulo: titulo || 'Conteúdo do Parceiro', // Usar título fornecido ou padrão
          url,
          tipo: tipoDetectado,
          categoria,
          descricao: descricao || '',
          plataforma: plataforma || '',
          cidade,
          endereco: endereco || '',
          dataEvento: dataEvento ? new Date(dataEvento) : null,
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
      const { id, parceiroId, titulo, url, tipo, categoria, descricao, plataforma, cidade, endereco, dataEvento, preco, vagas, fixado } = req.body;
      
      if (!id) return res.status(400).json({ error: 'ID obrigatório' });
      
      // Preparar dados para atualização
      const updateData: any = {};
      
      if (parceiroId !== undefined) updateData.parceiroId = parceiroId;
      if (titulo !== undefined) updateData.titulo = titulo || 'Conteúdo do Parceiro';
      if (url !== undefined) updateData.url = url;
      if (tipo !== undefined) updateData.tipo = tipo || 'evento';
      if (categoria !== undefined) updateData.categoria = categoria;
      if (descricao !== undefined) updateData.descricao = descricao;
      if (plataforma !== undefined) updateData.plataforma = plataforma;
      if (cidade !== undefined) updateData.cidade = cidade;
      if (endereco !== undefined) updateData.endereco = endereco;
      if (dataEvento !== undefined) updateData.dataEvento = dataEvento ? new Date(dataEvento) : null;
      if (preco !== undefined) updateData.preco = preco;
      if (vagas !== undefined) updateData.vagas = vagas;
      if (fixado !== undefined) updateData.fixado = Boolean(fixado);
      
      const atualizado = await prisma.conteudoParceiro.update({
        where: { id },
        data: updateData
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