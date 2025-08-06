import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Versão de demonstração - sempre funciona!
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
        },
        take: 10 // Limitar para demonstração
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

        const plataformasLive: Array<{
          plataforma: string
          titulo: string
          espectadores: number
          url: string
        }> = []

        // Simular lives baseado no ID do criador (sempre mostra alguns)
        const shouldShowLive = (criador.id.charCodeAt(0) % 3) === 0 // 33% de chance

        if (shouldShowLive) {
          const plataformas = [
            { name: 'YouTube', chance: 0.4, viewers: [100, 2000] },
            { name: 'Twitch', chance: 0.3, viewers: [50, 1500] },
            { name: 'Instagram', chance: 0.2, viewers: [20, 500] },
            { name: 'TikTok', chance: 0.1, viewers: [30, 800] }
          ]

          plataformas.forEach(plataforma => {
            if (Math.random() < plataforma.chance) {
              const [min, max] = plataforma.viewers
              const viewers = Math.floor(Math.random() * (max - min)) + min
              
              plataformasLive.push({
                plataforma: plataforma.name,
                titulo: `Live ${plataforma.name} - ${criador.usuario.nome}`,
                espectadores: viewers,
                url: `https://${plataforma.name.toLowerCase()}.com/${criador.usuario.nome.toLowerCase()}`
              })
            }
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
            seguidores: criador.apoiadores || Math.floor(Math.random() * 10000) + 100,
            doacoesRecebidas: criador.doacoes || Math.floor(Math.random() * 1000) + 10,
            totalSementes: criador.usuario.sementes,
            redesSociais,
            plataformasLive,
            totalEspectadores: plataformasLive.reduce((sum, p) => sum + (p.espectadores || 0), 0)
          })
        }
      }

      // Se não há criadores ao vivo, criar alguns de demonstração
      if (criadoresComLives.length === 0) {
        criadoresComLives.push({
          id: 'demo-1',
          usuarioId: 'demo-user-1',
          nome: 'Criador Demo',
          email: 'demo@sementesplay.com.br',
          bio: 'Criador de conteúdo da comunidade SementesPLAY',
          avatar: '/avatars/default.jpg',
          categoria: 'Geral',
          nivel: 'Criador Comum',
          seguidores: 1500,
          doacoesRecebidas: 250.50,
          totalSementes: 5000,
          redesSociais: {
            youtube: 'UCdemo',
            twitch: 'demo',
            instagram: 'demo',
            tiktok: 'demo',
            twitter: 'demo'
          },
          plataformasLive: [
            {
              plataforma: 'YouTube',
              titulo: 'Live Demo - SementesPLAY',
              espectadores: 850,
              url: 'https://youtube.com/channel/UCdemo'
            },
            {
              plataforma: 'Twitch',
              titulo: 'Stream Demo',
              espectadores: 320,
              url: 'https://twitch.tv/demo'
            }
          ],
          totalEspectadores: 1170
        })
      }

      return res.status(200).json({
        success: true,
        criadores: criadoresComLives,
        total: criadoresComLives.length,
        timestamp: Date.now(),
        demo: true
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