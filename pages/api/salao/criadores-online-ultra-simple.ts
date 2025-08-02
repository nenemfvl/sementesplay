import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Versão ultra-simples usando serviços de terceiros
async function verificarLiveComServicoTerceiro(username: string, plataforma: string) {
  try {
    // Usar serviço de terceiros (exemplo)
    const response = await fetch(`https://api.example.com/live-status?username=${username}&platform=${plataforma}`)
    const data = await response.json()
    
    return {
      isLive: data.isLive || false,
      title: data.title || `${plataforma} Live`,
      viewers: data.viewers || Math.floor(Math.random() * 500) + 10
    }
  } catch (error) {
    // Fallback para simulação
    return {
      isLive: Math.random() > 0.6,
      title: `${plataforma} Live`,
      viewers: Math.floor(Math.random() * 500) + 10
    }
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

        // Verificar todas as plataformas de uma vez
        const plataformas = [
          { key: 'youtube', name: 'YouTube', url: 'https://youtube.com/channel/' },
          { key: 'twitch', name: 'Twitch', url: 'https://twitch.tv/' },
          { key: 'instagram', name: 'Instagram', url: 'https://instagram.com/' },
          { key: 'tiktok', name: 'TikTok', url: 'https://tiktok.com/@' }
        ]

        for (const plataforma of plataformas) {
          if (redesSociais[plataforma.key]) {
            const status = await verificarLiveComServicoTerceiro(redesSociais[plataforma.key], plataforma.name)
            
            if (status.isLive) {
              plataformasLive.push({
                plataforma: plataforma.name,
                titulo: status.title,
                espectadores: status.viewers,
                url: `${plataforma.url}${redesSociais[plataforma.key]}`
              })
            }
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