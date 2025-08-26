import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { limit = 10 } = req.query

    // Buscar TODOS os conteúdos dos criadores para ter a base completa para ordenação
    const conteudos = await prisma.conteudo.findMany({
      where: {
        removido: false
      },
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
      }
      // Remover orderBy por data para permitir ordenação por pontuação
      // orderBy: {
      //   dataPublicacao: 'desc'
      // },
      // Buscar TODOS os conteúdos (sem limite) para ter a base completa
      // take: Math.max(parseInt(limit as string) || 10, 20)
    })

    // Calcular pontuação de popularidade para cada conteúdo
    const conteudosComPontuacao = conteudos.map(conteudo => {
      // Sistema de pontuação: visualizações (1 ponto), curtidas (3 pontos), compartilhamentos (5 pontos)
      const pontuacao = conteudo.visualizacoes + (conteudo.curtidas * 3) + (conteudo.compartilhamentos * 5)
      
      // Log para debug
      console.log(`Conteúdo: ${conteudo.titulo} - Views: ${conteudo.visualizacoes}, Likes: ${conteudo.curtidas}, Pontuação: ${pontuacao}`)
      
      return {
        ...conteudo,
        pontuacaoPopularidade: pontuacao
      }
    })

    // Ordenar por pontuação de popularidade (mais popular primeiro)
    conteudosComPontuacao.sort((a, b) => b.pontuacaoPopularidade - a.pontuacaoPopularidade)

    // Log da ordenação para debug
    console.log('Conteúdos ordenados por pontuação:')
    conteudosComPontuacao.forEach((c, i) => {
      console.log(`${i + 1}. ${c.titulo} - Pontuação: ${c.pontuacaoPopularidade}`)
    })

    // DEPOIS de ordenar por pontuação, limitar ao número solicitado
    const conteudosLimitados = conteudosComPontuacao.slice(0, parseInt(limit as string) || 10)

    // Função para gerar preview baseada no tipo e URL (mesma lógica do painel do criador)
    const gerarPreview = (conteudo: any) => {
      // Se já tem preview, usa ela
      if (conteudo.preview) {
        return conteudo.preview;
      }

      // Para vídeos do YouTube, usa a mesma lógica do painel do criador
      if (conteudo.tipo === 'video' && conteudo.url) {
        const yt = conteudo.url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
        if (yt) {
          try {
            return `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`;
          } catch (error) {
            // Se falhar, usar placeholder personalizado do YouTube
            return `https://via.placeholder.com/480x360/FF0000/FFFFFF?text=📺+YouTube+Video+${yt[1]}`;
          }
        }
      }

      // Para Twitch (videos ou streams)
      if (conteudo.url?.includes('twitch.tv')) {
        const tw = conteudo.url.match(/twitch.tv\/(videos\/)?([\w-]+)/);
        if (tw) {
          try {
            // Para vídeos do Twitch, usa a API de thumbnails
            if (tw[1]) {
              // É um vídeo
              return `https://static-cdn.jtvnw.net/cf_vods/d2nvs31859zcd8/${tw[2]}/thumb/thumb0-320x180.jpg`;
            } else {
              // É um canal/stream - usa thumbnail do canal
              return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${tw[2]}-320x180.jpg`;
            }
          } catch (error) {
            // Se falhar, usar placeholder personalizado do Twitch
            return `https://via.placeholder.com/320x180/9147FF/FFFFFF?text=🎮+Twitch+${tw[1] ? 'Video' : 'Channel'}+${tw[2]}`;
          }
        }
        // Se não conseguir extrair informações, retorna um placeholder genérico do Twitch
        return 'https://via.placeholder.com/320x180/9147FF/FFFFFF?text=🎮+Twitch+Content';
      }

      // Para Instagram
      if (conteudo.url?.includes('instagram.com')) {
        // Tentar extrair o ID do post do Instagram
        const instaMatch = conteudo.url.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/) ||
                          conteudo.url.match(/instagram\.com\/reel\/([a-zA-Z0-9_-]+)/);
        
        if (instaMatch) {
          const postId = instaMatch[1];
          if (conteudo.tipo === 'imagem') {
            // Para imagens, tentar usar a URL direta (pode funcionar em alguns casos)
            return conteudo.url;
          } else {
            // Para vídeos e outros tipos, usar placeholder personalizado do Instagram
            return `https://via.placeholder.com/400x400/833AB4/FFFFFF?text=📷+Instagram+Post+${postId}`;
          }
        }
        // Se não conseguir extrair o ID, retorna um placeholder genérico do Instagram
        return 'https://via.placeholder.com/400x400/833AB4/FFFFFF?text=📷+Instagram+Content';
      }

      // Para TikTok
      if (conteudo.url?.includes('tiktok.com')) {
        // Tentar extrair o ID do vídeo do TikTok (suporta diferentes formatos)
        const tiktokMatch = conteudo.url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/) || 
                           conteudo.url.match(/tiktok\.com\/v\/(\d+)/) ||
                           conteudo.url.match(/vm\.tiktok\.com\/(\w+)/);
        
        if (tiktokMatch) {
          const videoId = tiktokMatch[1];
          // Criar um placeholder personalizado que simula o estilo visual do TikTok
          // Usando proporção 9:16 (vertical) que é padrão do TikTok
          return `https://via.placeholder.com/360x640/000000/FFFFFF?text=🎵+TikTok+Video+${videoId}`;
        }
        // Se não conseguir extrair o ID, retorna um placeholder genérico do TikTok
        return 'https://via.placeholder.com/360x640/000000/FFFFFF?text=🎵+TikTok+Content';
      }

      // Para imagens, usa a própria URL
      if (conteudo.tipo === 'imagem' && conteudo.url) {
        return conteudo.url;
      }

      // Para outros tipos, retorna um placeholder genérico baseado no tipo
      if (conteudo.tipo) {
        const tipo = conteudo.tipo.toLowerCase();
        if (tipo.includes('video')) {
          return 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=🎬+Video+Content';
        } else if (tipo.includes('imagem') || tipo.includes('foto')) {
          return 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=🖼️+Image+Content';
        } else if (tipo.includes('link') || tipo.includes('url')) {
          return 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=🔗+Link+Content';
        } else {
          return 'https://via.placeholder.com/400x300/6B7280/FFFFFF?text=📄+Content';
        }
      }
      
      // Fallback final
      return 'https://via.placeholder.com/400x300/6B7280/FFFFFF?text=📄+Content';
    };

    // Formatar os conteúdos para o formato de notícias
    const noticias = conteudosLimitados.map((conteudo, index) => ({
      id: conteudo.id,
      titulo: conteudo.titulo,
      descricao: conteudo.descricao || `Novo conteúdo de ${conteudo.criador.usuario.nome}`,
      data: conteudo.dataPublicacao?.toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR'),
      link: `/criador/${conteudo.criador.id}`,
      tipo: conteudo.tipo,
      url: conteudo.url,
      preview: gerarPreview(conteudo),
      criador: {
        nome: conteudo.criador.usuario.nome,
        avatarUrl: conteudo.criador.usuario.avatarUrl
      },
      categoria: conteudo.categoria,
      // Informações de popularidade
      visualizacoes: conteudo.visualizacoes,
      curtidas: conteudo.curtidas,
      compartilhamentos: conteudo.compartilhamentos,
      pontuacaoPopularidade: conteudo.pontuacaoPopularidade
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