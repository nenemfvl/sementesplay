import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Criador {
  id: string
  nome: string
  email: string
  bio: string
  avatar: string
  categoria: string
  status: string
  nivel: string
  seguidores: number
  doacoesRecebidas: number
  totalSementes: number
  dataCriacao: Date
  dataAprovacao: Date
  redesSociais: {
    youtube?: string
    twitch?: string
    instagram?: string
  }
  estatisticas: {
    visualizacoes: number
    likes: number
    comentarios: number
    compartilhamentos: number
  }
  conteudos: Array<{
    id: string
    titulo: string
    tipo: string
    url: string
    thumbnail: string
    visualizacoes: number
    likes: number
    dataCriacao: Date
    status: string
  }>
  avaliacao: number
  tags: string[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { usuarioId } = req.query

      // Construir filtros
      const where: any = {}
      if (usuarioId) {
        where.usuarioId = String(usuarioId)
      }

      // Buscar criadores
      console.log('Buscando criadores no banco...')
      const criadores = await prisma.criador.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              sementes: true,
              dataCriacao: true
            }
          }
        },
        orderBy: {
          dataCriacao: 'desc'
        }
      })
      console.log('Criadores encontrados:', criadores.length)
      console.log('Primeiro criador:', criadores[0])

      const criadoresFormatados: Criador[] = criadores.map((criador: any) => {
        // Mapear nível numérico para nome descritivo
        const mapearNivel = (nivel: string) => {
          switch (nivel) {
            case '1':
            case 'comum':
              return 'Comum'
            case '2':
            case 'parceiro':
              return 'Parceiro'
            case '3':
            case 'supremo':
              return 'Supremo'
            case 'ouro':
              return 'Ouro'
            case 'prata':
              return 'Prata'
            case 'bronze':
              return 'Bronze'
            default:
              return 'Comum'
          }
        }

        // Processar redes sociais se existirem
        let redesSociais = {
          youtube: '',
          twitch: '',
          instagram: ''
        }
        
        try {
          if (criador.redesSociais) {
            const redes = JSON.parse(criador.redesSociais)
            redesSociais = { ...redesSociais, ...redes }
          }
        } catch (error) {
          console.log('Erro ao processar redes sociais:', error)
        }

        return {
          id: criador.id,
          nome: criador.usuario.nome,
          email: criador.usuario.email,
          bio: criador.bio || 'Criador de conteúdo da comunidade SementesPLAY',
          avatar: criador.usuario.avatarUrl || '/avatars/default.jpg',
          categoria: criador.categoria || 'Geral',
          status: 'ativo',
          nivel: mapearNivel(criador.nivel),
          seguidores: criador.apoiadores || 0,
          doacoesRecebidas: criador.doacoes || 0,
          totalSementes: criador.usuario.sementes,
          dataCriacao: criador.usuario.dataCriacao,
          dataAprovacao: criador.dataCriacao,
          redesSociais,
          estatisticas: {
            visualizacoes: 0,
            likes: 0,
            comentarios: 0,
            compartilhamentos: 0
          },
          conteudos: [],
          avaliacao: 0,
          tags: []
        }
      })

      return res.status(200).json({
        success: true,
        criadores: criadoresFormatados,
        total: criadoresFormatados.length
      })
    } catch (error) {
      console.error('Erro ao buscar criadores:', error)
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({
      success: false,
      message: `Método ${req.method} não permitido`
    })
  }
} 