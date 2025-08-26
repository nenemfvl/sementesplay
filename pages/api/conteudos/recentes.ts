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
          return `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`;
        }
      }

      // Para Twitch (videos ou streams)
      if (conteudo.url?.includes('twitch.tv')) {
        // Retorna null para usar ícone, já que as thumbnails do Twitch podem expirar
        return null;
      }

      // Para Instagram
      if (conteudo.url?.includes('instagram.com')) {
        // Tentar extrair o ID do post do Instagram
        const instaMatch = conteudo.url.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/) ||
                          conteudo.url.match(/instagram\.com\/reel\/([a-zA-Z0-9_-]+)/);
        
        if (instaMatch) {
          const postId = instaMatch[1];
          if (conteudo.tipo === 'imagem') {
            // Para imagens, tentar usar a URL direta
            return conteudo.url;
          }
          // Para vídeos e outros tipos, retorna null para usar ícone
          return null;
        }
        // Se não conseguir extrair o ID, retorna null
        return null;
      }

      // Para TikTok
      if (conteudo.url?.includes('tiktok.com')) {
        // Tentar extrair o ID do vídeo do TikTok (suporta diferentes formatos)
        const tiktokMatch = conteudo.url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/) || 
                           conteudo.url.match(/tiktok\.com\/v\/(\d+)/) ||
                           conteudo.url.match(/vm\.tiktok\.com\/(\w+)/);
        
        if (tiktokMatch) {
          const videoId = tiktokMatch[1];
          // Retorna null para usar ícone, já que não conseguimos thumbnail direta
          return null;
        }
        // Se não conseguir extrair o ID, retorna null
        return null;
      }

      // Para imagens, usa a própria URL
      if (conteudo.tipo === 'imagem' && conteudo.url) {
        return conteudo.url;
      }

      // Para outros tipos, retorna null para usar ícone
      return null;
    };

    // Formatar os conteúdos para o formato de notícias
    const noticias = conteudosLimitados.map((conteudo, index) => {
      // Detectar automaticamente o tipo baseado na URL para melhorar a experiência
      let tipoDetectado = conteudo.tipo;
      
      if (conteudo.url) {
        if (conteudo.url.includes('tiktok.com')) {
          tipoDetectado = 'tiktok';
        } else if (conteudo.url.includes('instagram.com')) {
          tipoDetectado = 'instagram';
        } else if (conteudo.url.includes('youtube.com') || conteudo.url.includes('youtu.be')) {
          tipoDetectado = 'youtube';
        } else if (conteudo.url.includes('twitch.tv')) {
          tipoDetectado = 'twitch';
        }
      }
      
      return {
        id: conteudo.id,
        titulo: conteudo.titulo,
        descricao: conteudo.descricao || `Novo conteúdo de ${conteudo.criador.usuario.nome}`,
        data: conteudo.dataPublicacao?.toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR'),
        link: `/criador/${conteudo.criador.id}`,
        tipo: tipoDetectado,
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
      };
    })

    return res.status(200).json({
      noticias,
      total: noticias.length
    })
  } catch (error) {
    console.error('Erro ao buscar conteúdos recentes:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 