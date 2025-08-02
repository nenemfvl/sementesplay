import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Função para verificar se um canal do YouTube está ao vivo
async function verificarYouTubeLive(channelId: string): Promise<{ isLive: boolean; title?: string; viewers?: number }> {
  try {
    // Para produção, você precisará de uma API key do YouTube
    // const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&eventType=live&key=YOUR_API_KEY`)
    // const data = await response.json()
    
    // Por enquanto, simulando resposta
    return {
      isLive: Math.random() > 0.7, // 30% de chance de estar ao vivo
      title: 'Live SementesPLAY',
      viewers: Math.floor(Math.random() * 1000) + 50
    }
  } catch (error) {
    console.error('Erro ao verificar YouTube:', error)
    return { isLive: false }
  }
}

// Função para verificar se um canal da Twitch está ao vivo
async function verificarTwitchLive(username: string): Promise<{ isLive: boolean; title?: string; viewers?: number }> {
  try {
    // Para produção, você precisará do Client ID e Access Token da Twitch
    // const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${username}`, {
    //   headers: {
    //     'Client-ID': 'YOUR_CLIENT_ID',
    //     'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
    //   }
    // })
    // const data = await response.json()
    
    // Por enquanto, simulando resposta
    return {
      isLive: Math.random() > 0.6, // 40% de chance de estar ao vivo
      title: 'Stream SementesPLAY',
      viewers: Math.floor(Math.random() * 500) + 20
    }
  } catch (error) {
    console.error('Erro ao verificar Twitch:', error)
    return { isLive: false }
  }
}

// Função para verificar se um perfil do Instagram está ao vivo
async function verificarInstagramLive(username: string): Promise<{ isLive: boolean; title?: string; viewers?: number }> {
  try {
    // Instagram não tem API pública para isso, seria necessário usar web scraping
    // Por enquanto, simulando resposta
    return {
      isLive: Math.random() > 0.8, // 20% de chance de estar ao vivo
      title: 'Instagram Live',
      viewers: Math.floor(Math.random() * 200) + 10
    }
  } catch (error) {
    console.error('Erro ao verificar Instagram:', error)
    return { isLive: false }
  }
}

// Função para verificar se um perfil do TikTok está ao vivo
async function verificarTikTokLive(username: string): Promise<{ isLive: boolean; title?: string; viewers?: number }> {
  try {
    // TikTok não tem API pública para isso, seria necessário usar web scraping
    // Por enquanto, simulando resposta
    return {
      isLive: Math.random() > 0.85, // 15% de chance de estar ao vivo
      title: 'TikTok Live',
      viewers: Math.floor(Math.random() * 300) + 15
    }
  } catch (error) {
    console.error('Erro ao verificar TikTok:', error)
    return { isLive: false }
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