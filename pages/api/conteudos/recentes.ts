import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { limit = 10 } = req.query

    // Buscar MAIS conteúdos para ter uma base maior para ordenação
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
      },
      // Remover orderBy por data para permitir ordenação por pontuação
      // orderBy: {
      //   dataPublicacao: 'desc'
      // },
      // Buscar mais conteúdos para ter uma base melhor para ordenação
      take: Math.max(parseInt(limit as string) || 10, 20)
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
        const tw = conteudo.url.match(/twitch.tv\/(videos\/)?([\w-]+)/);
        if (tw) {
          // Para vídeos do Twitch, usa a API de thumbnails
          if (tw[1]) {
            // É um vídeo
            return `https://static-cdn.jtvnw.net/cf_vods/d2nvs31859zcd8/${tw[2]}/thumb/thumb0-320x180.jpg`;
          } else {
            // É um canal/stream - usa thumbnail do canal
            return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${tw[2]}-320x180.jpg`;
          }
        }
      }

      // Para Instagram
      if (conteudo.url?.includes('instagram.com')) {
        // Instagram não permite thumbnails diretas, mas podemos usar um placeholder
        // ou tentar extrair a imagem se for um post de imagem
        if (conteudo.tipo === 'imagem') {
          return conteudo.url;
        }
        // Para vídeos do Instagram, retorna null (usará ícone)
        return null;
      }

      // Para TikTok
      if (conteudo.url?.includes('tiktok.com')) {
        // TikTok também não permite thumbnails diretas
        // Para vídeos do TikTok, retorna null (usará ícone)
        return null;
      }

      // Para imagens, usa a própria URL
      if (conteudo.tipo === 'imagem' && conteudo.url) {
        return conteudo.url;
      }

      // Para outros tipos, retorna null (usará ícone)
      return null;
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