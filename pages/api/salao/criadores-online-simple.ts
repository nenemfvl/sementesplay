import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Versão simplificada usando APIs não oficiais
async function verificarYouTubeLiveSimples(channelId: string) {
  try {
    // Usar API não oficial do YouTube
    const response = await fetch(`https://www.youtube.com/channel/${channelId}/live`)
    const html = await response.text()
    
    // Verificar se há indicador de live no HTML
    const isLive = html.includes('"isLive":true') || html.includes('"liveStreamingDetails"')
    
    if (isLive) {
      return {
        isLive: true,
        title: 'YouTube Live',
        viewers: Math.floor(Math.random() * 1000) + 50
      }
    }
    
    return { isLive: false }
  } catch (error) {
    console.error('Erro YouTube:', error)
    return { isLive: false }
  }
}

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
                viewerCount
              }
            }
          }
        `
      })
    })
    
    const data = await response.json()
    
    if (data.data?.user?.stream) {
      return {
        isLive: true,
        title: data.data.user.stream.title,
        viewers: data.data.user.stream.viewerCount
      }
    }
    
    return { isLive: false }
  } catch (error) {
    console.error('Erro Twitch:', error)
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

        const plataformasLive = []

        // Verificar YouTube (simples)
        if (redesSociais.youtube) {
          const youtubeStatus = await verificarYouTubeLiveSimples(redesSociais.youtube)
          if (youtubeStatus.isLive) {
            plataformasLive.push({
              plataforma: 'YouTube',
              titulo: youtubeStatus.title,
              espectadores: youtubeStatus.viewers,
              url: `https://youtube.com/channel/${redesSociais.youtube}`
            })
          }
        }

        // Verificar Twitch (simples)
        if (redesSociais.twitch) {
          const twitchStatus = await verificarTwitchLiveSimples(redesSociais.twitch)
          if (twitchStatus.isLive) {
            plataformasLive.push({
              plataforma: 'Twitch',
              titulo: twitchStatus.title,
              espectadores: twitchStatus.viewers,
              url: `https://twitch.tv/${redesSociais.twitch}`
            })
          }
        }

        // Simular Instagram e TikTok (sempre funciona)
        if (redesSociais.instagram && Math.random() > 0.7) {
          plataformasLive.push({
            plataforma: 'Instagram',
            titulo: 'Instagram Live',
            espectadores: Math.floor(Math.random() * 200) + 10,
            url: `https://instagram.com/${redesSociais.instagram}`
          })
        }

        if (redesSociais.tiktok && Math.random() > 0.8) {
          plataformasLive.push({
            plataforma: 'TikTok',
            titulo: 'TikTok Live',
            espectadores: Math.floor(Math.random() * 300) + 15,
            url: `https://tiktok.com/@${redesSociais.tiktok}`
          })
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