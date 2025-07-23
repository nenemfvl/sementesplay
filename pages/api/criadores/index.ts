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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Buscar criadores aprovados
      const criadores = await prisma.criador.findMany({
        where: {
          status: 'aprovado'
        },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              sementes: true,
              dataCriacao: true
            }
          },
          conteudos: {
            where: {
              ativo: true
            },
            orderBy: {
              dataCriacao: 'desc'
            },
            take: 5
          }
        },
        orderBy: {
          dataAprovacao: 'desc'
        }
      })

      const criadoresFormatados: Criador[] = criadores.map(criador => ({
        id: criador.id,
        nome: criador.usuario.nome,
        email: criador.usuario.email,
        bio: criador.bio || 'Criador de conteúdo da comunidade SementesPLAY',
        avatar: criador.avatar || '/avatars/default.jpg',
        categoria: criador.categoria || 'geral',
        status: criador.status,
        nivel: criador.nivel || '1',
        seguidores: criador.seguidores || 0,
        doacoesRecebidas: criador.doacoesRecebidas || 0,
        totalSementes: criador.usuario.sementes,
        dataCriacao: criador.usuario.dataCriacao,
        dataAprovacao: criador.dataAprovacao,
        redesSociais: {
          youtube: criador.youtube,
          twitch: criador.twitch,
          instagram: criador.instagram
        },
        estatisticas: {
          visualizacoes: criador.visualizacoes || 0,
          likes: criador.likes || 0,
          comentarios: criador.comentarios || 0,
          compartilhamentos: criador.compartilhamentos || 0
        },
        conteudos: criador.conteudos.map(conteudo => ({
          id: conteudo.id,
          titulo: conteudo.titulo,
          tipo: conteudo.tipo,
          url: conteudo.url,
          thumbnail: conteudo.thumbnail || '/thumbnails/default.jpg',
          visualizacoes: conteudo.visualizacoes || 0,
          likes: conteudo.likes || 0,
          dataCriacao: conteudo.dataCriacao,
          status: conteudo.ativo ? 'ativo' : 'inativo'
        })),
        avaliacao: criador.avaliacao || 0,
        tags: criador.tags ? JSON.parse(criador.tags) : []
      }))

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