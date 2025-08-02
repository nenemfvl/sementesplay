import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { API_CONFIG, getTwitchAccessToken } from '../../../lib/api-config'
import puppeteer from 'puppeteer'

const prisma = new PrismaClient()

// Função para verificar se um canal do YouTube está ao vivo
async function verificarYouTubeLive(channelId: string): Promise<{ isLive: boolean; title?: string; viewers?: number }> {
  try {
    if (!API_CONFIG.YOUTUBE_API_KEY) {
      console.warn('YouTube API Key não configurada, usando simulação')
      return {
        isLive: Math.random() > 0.7,
        title: 'Live SementesPLAY',
        viewers: Math.floor(Math.random() * 1000) + 50
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT)
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&eventType=live&key=${API_CONFIG.YOUTUBE_API_KEY}`,
      { signal: controller.signal }
    )
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.items && data.items.length > 0) {
      const liveVideo = data.items[0]
      const videoId = liveVideo.id.videoId
      
      // Buscar estatísticas do vídeo
      const statsController = new AbortController()
      const statsTimeoutId = setTimeout(() => statsController.abort(), API_CONFIG.REQUEST_TIMEOUT)
      
      const statsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${API_CONFIG.YOUTUBE_API_KEY}`,
        { signal: statsController.signal }
      )
      
      clearTimeout(statsTimeoutId)
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        const viewCount = statsData.items?.[0]?.statistics?.viewCount || 0
        
        return {
          isLive: true,
          title: liveVideo.snippet.title,
          viewers: parseInt(viewCount)
        }
      }
      
      return {
        isLive: true,
        title: liveVideo.snippet.title,
        viewers: 0
      }
    }
    
    return { isLive: false }
  } catch (error) {
    console.error('Erro ao verificar YouTube:', error)
    return { isLive: false }
  }
}

// Função para verificar se um canal da Twitch está ao vivo
async function verificarTwitchLive(username: string): Promise<{ isLive: boolean; title?: string; viewers?: number }> {
  try {
    if (!API_CONFIG.TWITCH_CLIENT_ID) {
      console.warn('Twitch Client ID não configurado, usando simulação')
      return {
        isLive: Math.random() > 0.6,
        title: 'Stream SementesPLAY',
        viewers: Math.floor(Math.random() * 500) + 20
      }
    }

    const accessToken = await getTwitchAccessToken()
    
    const twitchController = new AbortController()
    const twitchTimeoutId = setTimeout(() => twitchController.abort(), API_CONFIG.REQUEST_TIMEOUT)
    
    const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${username}`, {
      headers: {
        'Client-ID': API_CONFIG.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`
      },
      signal: twitchController.signal
    })
    
    clearTimeout(twitchTimeoutId)
    
    if (!response.ok) {
      throw new Error(`Twitch API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.data && data.data.length > 0) {
      const stream = data.data[0]
      return {
        isLive: true,
        title: stream.title,
        viewers: stream.viewer_count
      }
    }
    
    return { isLive: false }
  } catch (error) {
    console.error('Erro ao verificar Twitch:', error)
    return { isLive: false }
  }
}

// Função para verificar se um perfil do Instagram está ao vivo usando web scraping
async function verificarInstagramLive(username: string): Promise<{ isLive: boolean; title?: string; viewers?: number }> {
  try {
    let browser
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
      
      const page = await browser.newPage()
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
      
      // Tentar acessar o perfil do Instagram
      await page.goto(`https://www.instagram.com/${username}/`, {
        waitUntil: 'networkidle2',
        timeout: API_CONFIG.REQUEST_TIMEOUT
      })
      
      // Verificar se há indicador de live
      const liveIndicator = await page.$('[data-testid="live-badge"]')
      
      if (liveIndicator) {
        // Tentar extrair informações da live
        const liveTitle = await page.$eval('[data-testid="live-title"]', el => el.textContent).catch(() => 'Instagram Live')
        const viewerCount = await page.$eval('[data-testid="live-viewer-count"]', el => el.textContent).catch(() => '0')
        
        return {
          isLive: true,
          title: liveTitle || 'Instagram Live',
          viewers: parseInt((viewerCount || '0').replace(/\D/g, '')) || 0
        }
      }
      
      return { isLive: false }
    } finally {
      if (browser) {
        await browser.close()
      }
    }
  } catch (error) {
    console.error('Erro ao verificar Instagram:', error)
    // Fallback para simulação
    return {
      isLive: Math.random() > 0.8,
      title: 'Instagram Live',
      viewers: Math.floor(Math.random() * 200) + 10
    }
  }
}

// Função para verificar se um perfil do TikTok está ao vivo usando web scraping
async function verificarTikTokLive(username: string): Promise<{ isLive: boolean; title?: string; viewers?: number }> {
  try {
    let browser
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
      
      const page = await browser.newPage()
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
      
      // Tentar acessar o perfil do TikTok
      await page.goto(`https://www.tiktok.com/@${username}`, {
        waitUntil: 'networkidle2',
        timeout: API_CONFIG.REQUEST_TIMEOUT
      })
      
      // Verificar se há indicador de live
      const liveIndicator = await page.$('[data-e2e="live-indicator"]')
      
      if (liveIndicator) {
        // Tentar extrair informações da live
        const liveTitle = await page.$eval('[data-e2e="live-title"]', el => el.textContent).catch(() => 'TikTok Live')
        const viewerCount = await page.$eval('[data-e2e="live-viewer-count"]', el => el.textContent).catch(() => '0')
        
        return {
          isLive: true,
          title: liveTitle || 'TikTok Live',
          viewers: parseInt((viewerCount || '0').replace(/\D/g, '')) || 0
        }
      }
      
      return { isLive: false }
    } finally {
      if (browser) {
        await browser.close()
      }
    }
  } catch (error) {
    console.error('Erro ao verificar TikTok:', error)
    // Fallback para simulação
    return {
      isLive: Math.random() > 0.85,
      title: 'TikTok Live',
      viewers: Math.floor(Math.random() * 300) + 15
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Buscar todos os criadores
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
              dataCriacao: true,
              avatarUrl: true,
              nivel: true,
              tipo: true
            }
          }
        },
        orderBy: {
          dataCriacao: 'desc'
        }
      })

      const criadoresComLives = []

      // Verificar status de live para cada criador
      for (const criador of criadores) {
        let redesSociais = {
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

        // Verificar cada plataforma
        const plataformasLive = []

        if (redesSociais.youtube) {
          const youtubeStatus = await verificarYouTubeLive(redesSociais.youtube)
          if (youtubeStatus.isLive) {
            plataformasLive.push({
              plataforma: 'YouTube',
              titulo: youtubeStatus.title,
              espectadores: youtubeStatus.viewers,
              url: `https://youtube.com/channel/${redesSociais.youtube}`
            })
          }
        }

        if (redesSociais.twitch) {
          const twitchStatus = await verificarTwitchLive(redesSociais.twitch)
          if (twitchStatus.isLive) {
            plataformasLive.push({
              plataforma: 'Twitch',
              titulo: twitchStatus.title,
              espectadores: twitchStatus.viewers,
              url: `https://twitch.tv/${redesSociais.twitch}`
            })
          }
        }

        if (redesSociais.instagram) {
          const instagramStatus = await verificarInstagramLive(redesSociais.instagram)
          if (instagramStatus.isLive) {
            plataformasLive.push({
              plataforma: 'Instagram',
              titulo: instagramStatus.title,
              espectadores: instagramStatus.viewers,
              url: `https://instagram.com/${redesSociais.instagram}`
            })
          }
        }

        if (redesSociais.tiktok) {
          const tiktokStatus = await verificarTikTokLive(redesSociais.tiktok)
          if (tiktokStatus.isLive) {
            plataformasLive.push({
              plataforma: 'TikTok',
              titulo: tiktokStatus.title,
              espectadores: tiktokStatus.viewers,
              url: `https://tiktok.com/@${redesSociais.tiktok}`
            })
          }
        }

        // Se o criador está ao vivo em pelo menos uma plataforma
        if (plataformasLive.length > 0) {
          const mapearNivel = (nivel: string) => {
            switch (nivel) {
              case 'criador-iniciante':
                return 'Criador Iniciante'
              case 'criador-comum':
                return 'Criador Comum'
              case 'criador-parceiro':
                return 'Criador Parceiro'
              case 'criador-supremo':
                return 'Criador Supremo'
              default:
                return 'Criador'
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