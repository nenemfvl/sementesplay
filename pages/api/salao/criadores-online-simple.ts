import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
// Função para extrair o ID do canal do YouTube de uma URL
function extrairChannelId(url: string): string | null {
  // Se já é um ID de canal (começa com UC)
  if (url.startsWith('UC') && url.length === 24) {
    return url
  }
  
  // Se é uma URL completa
  if (url.includes('youtube.com')) {
    // Tentar extrair de diferentes formatos
    const patterns = [
      /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/@([a-zA-Z0-9_-]+)/,
      /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/user\/([a-zA-Z0-9_-]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }
  }
  
  return null
}

// Verificar YouTube usando API pública real
async function verificarYouTubeLiveSimples(youtubeUrl: string) {
  try {
    // Extrair o ID ou username do canal
    const channelId = extrairChannelId(youtubeUrl)
    
    if (!channelId) {
      console.error('Não foi possível extrair ID do canal:', youtubeUrl)
      return { isLive: false }
    }
    
    let url: string
    
    // Se é um @username, usar a URL do canal diretamente
    if (youtubeUrl.includes('/@')) {
      url = `https://www.youtube.com/@${channelId}/live`
    } else {
      // Se é um channel ID, usar a URL do canal
      url = `https://www.youtube.com/channel/${channelId}/live`
    }
    
    console.log(`Verificando YouTube: ${url}`)
    
    // Usar API pública do YouTube (sem chave)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      console.log(`YouTube response not ok: ${response.status}`)
      return { isLive: false }
    }
    
    const html = await response.text()
    
    // Verificar indicadores reais de live no HTML
    const isLive = html.includes('"isLive":true') || 
                   html.includes('"liveStreamingDetails"') ||
                   html.includes('"liveBroadcastDetails"') ||
                   html.includes('"liveContent"') ||
                   html.includes('"liveBroadcastDetails"') ||
                   html.includes('"isLiveContent"')
    
    if (isLive) {
      // Extrair título real se possível
      const titleMatch = html.match(/"title":"([^"]+)"/)
      const title = titleMatch ? titleMatch[1] : 'YouTube Live'
      
      // Extrair viewers reais se possível
      const viewerMatch = html.match(/"viewCount":"(\d+)"/)
      const viewers = viewerMatch ? parseInt(viewerMatch[1]) : 0
      
      console.log(`Live detectada: ${title} (${viewers} viewers)`)
      
      return {
        isLive: true,
        title: title,
        viewers: viewers || 0
      }
    }
    
    console.log('Nenhuma live detectada')
    return { isLive: false }
  } catch (error) {
    console.error('Erro YouTube:', error)
    return { isLive: false }
  }
}

// Verificar Twitch usando API pública real
async function verificarTwitchLiveSimples(username: string) {
  try {
    // Usar API pública da Twitch (sem autenticação)
    const response = await fetch(`https://gql.twitch.tv/gql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko'
      },
      body: JSON.stringify({
        query: `
          query {
            user(login: "${username}") {
              stream {
                id
                title
                type
                game {
                  name
                }
              }
            }
          }
        `
      })
    })
    
    if (!response.ok) {
      return { isLive: false }
    }
    
    const data = await response.json()
    
    if (data.data?.user?.stream) {
      const stream = data.data.user.stream
      return {
        isLive: true,
        title: stream.title || 'Twitch Stream',
        viewers: 0 // Twitch não expõe viewerCount na API pública
      }
    }
    
    return { isLive: false }
  } catch (error) {
    console.error('Erro Twitch:', error)
    return { isLive: false }
  }
}

// Verificar Instagram usando web scraping real
async function verificarInstagramLiveSimples(username: string) {
  try {
    // Usar API pública do Instagram (sem autenticação)
    const response = await fetch(`https://www.instagram.com/${username}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      return { isLive: false }
    }
    
    const html = await response.text()
    
    // Verificar indicadores reais de live
    const isLive = html.includes('"is_live":true') || 
                   html.includes('"live_broadcast"') ||
                   html.includes('"live_indicator"')
    
    if (isLive) {
      return {
        isLive: true,
        title: 'Instagram Live',
        viewers: 0 // Instagram não expõe viewers facilmente
      }
    }
    
    return { isLive: false }
  } catch (error) {
    console.error('Erro Instagram:', error)
    return { isLive: false }
  }
}

// Verificar TikTok usando web scraping real
async function verificarTikTokLiveSimples(username: string) {
  try {
    // Usar API pública do TikTok (sem autenticação)
    const response = await fetch(`https://www.tiktok.com/@${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      return { isLive: false }
    }
    
    const html = await response.text()
    
    // Verificar indicadores reais de live
    const isLive = html.includes('"isLive":true') || 
                   html.includes('"liveStream"') ||
                   html.includes('"live_indicator"')
    
    if (isLive) {
      return {
        isLive: true,
        title: 'TikTok Live',
        viewers: 0 // TikTok não expõe viewers facilmente
      }
    }
    
    return { isLive: false }
  } catch (error) {
    console.error('Erro TikTok:', error)
    return { isLive: false }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const criadores = await prisma.criador.findMany({
        where: {
          usuario: {
            nivel: {
              in: ['criador-supremo', 'criador-parceiro', 'criador-comum', 'criador-iniciante']
            }
          }
        },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              sementes: true,
              avatarUrl: true,
              nivel: true
            }
          }
        }
      })

      const criadoresComLives = []

      for (const criador of criadores) {
        let redesSociais: Record<string, string> = {
          youtube: '',
          twitch: '',
          instagram: '',
          tiktok: '',
          twitter: ''
        }
        
        try {
          if (criador.redesSociais) {
            const redes = JSON.parse(criador.redesSociais)
            redesSociais = { ...redesSociais, ...redes }
          }
        } catch (error) {
          console.log('Erro ao processar redes sociais:', error)
        }

        const plataformasLive: Array<{
          plataforma: string
          titulo: string
          espectadores: number
          url: string
        }> = []

        // Verificar YouTube (real)
        if (redesSociais.youtube) {
          const youtubeStatus = await verificarYouTubeLiveSimples(redesSociais.youtube)
          if (youtubeStatus.isLive) {
            // Usar a URL original do YouTube para o link
            plataformasLive.push({
              plataforma: 'YouTube',
              titulo: youtubeStatus.title || 'YouTube Live',
              espectadores: youtubeStatus.viewers || 0,
              url: redesSociais.youtube
            })
          }
        }

        // Verificar Twitch (real)
        if (redesSociais.twitch) {
          // Extrair username da URL do Twitch
          let twitchUsername = redesSociais.twitch
          if (twitchUsername.includes('twitch.tv/')) {
            twitchUsername = twitchUsername.split('twitch.tv/')[1].split('/')[0].split('?')[0]
          }
          
          const twitchStatus = await verificarTwitchLiveSimples(twitchUsername)
          if (twitchStatus.isLive) {
            plataformasLive.push({
              plataforma: 'Twitch',
              titulo: twitchStatus.title || 'Twitch Stream',
              espectadores: twitchStatus.viewers || 0,
              url: `https://twitch.tv/${twitchUsername}`
            })
          }
        }

        // Verificar Instagram (real)
        if (redesSociais.instagram) {
          const instagramStatus = await verificarInstagramLiveSimples(redesSociais.instagram)
          if (instagramStatus.isLive) {
            plataformasLive.push({
              plataforma: 'Instagram',
              titulo: instagramStatus.title || 'Instagram Live',
              espectadores: instagramStatus.viewers || 0,
              url: `https://instagram.com/${redesSociais.instagram}`
            })
          }
        }

        // Verificar TikTok (real)
        if (redesSociais.tiktok) {
          const tiktokStatus = await verificarTikTokLiveSimples(redesSociais.tiktok)
          if (tiktokStatus.isLive) {
            plataformasLive.push({
              plataforma: 'TikTok',
              titulo: tiktokStatus.title || 'TikTok Live',
              espectadores: tiktokStatus.viewers || 0,
              url: `https://tiktok.com/@${redesSociais.tiktok}`
            })
          }
        }

        if (plataformasLive.length > 0) {
          const mapearNivel = (nivel: string) => {
            switch (nivel) {
              case 'criador-iniciante': return 'Criador Iniciante'
              case 'criador-comum': return 'Criador Comum'
              case 'criador-parceiro': return 'Criador Parceiro'
              case 'criador-supremo': return 'Criador Supremo'
              default: return 'Criador'
            }
          }

          criadoresComLives.push({
            id: criador.id,
            usuarioId: criador.usuario.id,
            nome: criador.usuario.nome,
            email: criador.usuario.email,
            bio: criador.bio || 'Criador de conteúdo da comunidade SementesPLAY',
            avatar: criador.usuario.avatarUrl || '/avatars/default.jpg',
            categoria: criador.categoria || 'Geral',
            nivel: mapearNivel(criador.usuario.nivel),
            seguidores: criador.apoiadores || 0,
            doacoesRecebidas: criador.doacoes || 0,
            totalSementes: criador.usuario.sementes,
            redesSociais,
            plataformasLive,
            totalEspectadores: plataformasLive.reduce((sum, p) => sum + (p.espectadores || 0), 0)
          })
        }
      }

      return res.status(200).json({
        success: true,
        criadores: criadoresComLives,
        total: criadoresComLives.length,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error('Erro ao buscar criadores ao vivo:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  }

  res.setHeader('Allow', ['GET'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
} 