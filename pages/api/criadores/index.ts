import { NextApiRequest, NextApiResponse } from 'next'

interface Criador {
  id: string
  nome: string
  email: string
  bio: string
  avatar: string
  categoria: string
  status: 'ativo' | 'pendente' | 'rejeitado' | 'suspenso'
  nivel: string
  seguidores: number
  doacoesRecebidas: number
  totalSementes: number
  dataCriacao: Date
  dataAprovacao?: Date
  redesSociais: {
    youtube?: string
    twitch?: string
    instagram?: string
    twitter?: string
  }
  estatisticas: {
    visualizacoes: number
    likes: number
    comentarios: number
    compartilhamentos: number
  }
  conteudos: any[]
  avaliacao: number
  tags: string[]
}

const criadoresMock: Criador[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao@example.com',
    bio: 'Criador de conteúdo focado em gaming e tecnologia. Apaixonado por jogos indie e desenvolvimento de software.',
    avatar: '/avatars/joao.jpg',
    categoria: 'gaming',
    status: 'ativo',
    nivel: '5',
    seguidores: 15420,
    doacoesRecebidas: 2340,
    totalSementes: 125000,
    dataCriacao: new Date('2024-01-15'),
    dataAprovacao: new Date('2024-01-20'),
    redesSociais: {
      youtube: 'https://youtube.com/@joaosilva',
      twitch: 'https://twitch.tv/joaosilva',
      instagram: 'https://instagram.com/joaosilva'
    },
    estatisticas: {
      visualizacoes: 1250000,
      likes: 45000,
      comentarios: 8900,
      compartilhamentos: 2300
    },
    conteudos: [
      {
        id: '1',
        titulo: 'Review: Novo Jogo Indie',
        tipo: 'video',
        url: 'https://youtube.com/watch?v=123',
        thumbnail: '/thumbnails/video1.jpg',
        visualizacoes: 45000,
        likes: 1200,
        dataCriacao: new Date('2024-07-15'),
        status: 'ativo'
      }
    ],
    avaliacao: 4.8,
    tags: ['gaming', 'review', 'indie']
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria@example.com',
    bio: 'Especialista em lifestyle e bem-estar. Compartilhando dicas de saúde, fitness e qualidade de vida.',
    avatar: '/avatars/maria.jpg',
    categoria: 'lifestyle',
    status: 'ativo',
    nivel: '4',
    seguidores: 8900,
    doacoesRecebidas: 1560,
    totalSementes: 78000,
    dataCriacao: new Date('2024-02-10'),
    dataAprovacao: new Date('2024-02-15'),
    redesSociais: {
      instagram: 'https://instagram.com/mariasantos',
      youtube: 'https://youtube.com/@mariasantos'
    },
    estatisticas: {
      visualizacoes: 890000,
      likes: 32000,
      comentarios: 5600,
      compartilhamentos: 1800
    },
    conteudos: [
      {
        id: '2',
        titulo: 'Rotina Matinal Completa',
        tipo: 'video',
        url: 'https://youtube.com/watch?v=456',
        thumbnail: '/thumbnails/video2.jpg',
        visualizacoes: 32000,
        likes: 980,
        dataCriacao: new Date('2024-07-14'),
        status: 'ativo'
      }
    ],
    avaliacao: 4.6,
    tags: ['lifestyle', 'fitness', 'saude']
  },
  {
    id: '3',
    nome: 'Pedro Costa',
    email: 'pedro@example.com',
    bio: 'Desenvolvedor e educador de tecnologia. Ensinando programação e compartilhando conhecimento técnico.',
    avatar: '/avatars/pedro.jpg',
    categoria: 'tech',
    status: 'ativo',
    nivel: '6',
    seguidores: 23400,
    doacoesRecebidas: 3450,
    totalSementes: 180000,
    dataCriacao: new Date('2024-01-05'),
    dataAprovacao: new Date('2024-01-10'),
    redesSociais: {
      youtube: 'https://youtube.com/@pedrocosta',
      twitter: 'https://twitter.com/pedrocosta',
      instagram: 'https://instagram.com/pedrocosta'
    },
    estatisticas: {
      visualizacoes: 2100000,
      likes: 78000,
      comentarios: 12300,
      compartilhamentos: 4500
    },
    conteudos: [
      {
        id: '3',
        titulo: 'Tutorial: React Hooks',
        tipo: 'video',
        url: 'https://youtube.com/watch?v=789',
        thumbnail: '/thumbnails/video3.jpg',
        visualizacoes: 67000,
        likes: 2100,
        dataCriacao: new Date('2024-07-13'),
        status: 'ativo'
      }
    ],
    avaliacao: 4.9,
    tags: ['tech', 'programacao', 'react']
  },
  {
    id: '4',
    nome: 'Ana Oliveira',
    email: 'ana@example.com',
    bio: 'Criadora de conteúdo educacional. Focada em matemática e ciências para estudantes.',
    avatar: '/avatars/ana.jpg',
    categoria: 'educacao',
    status: 'pendente',
    nivel: '3',
    seguidores: 5600,
    doacoesRecebidas: 890,
    totalSementes: 45000,
    dataCriacao: new Date('2024-06-20'),
    redesSociais: {
      youtube: 'https://youtube.com/@anaoliveira',
      instagram: 'https://instagram.com/anaoliveira'
    },
    estatisticas: {
      visualizacoes: 450000,
      likes: 18000,
      comentarios: 3200,
      compartilhamentos: 900
    },
    conteudos: [
      {
        id: '4',
        titulo: 'Aula: Álgebra Linear',
        tipo: 'video',
        url: 'https://youtube.com/watch?v=101',
        thumbnail: '/thumbnails/video4.jpg',
        visualizacoes: 28000,
        likes: 750,
        dataCriacao: new Date('2024-07-12'),
        status: 'ativo'
      }
    ],
    avaliacao: 4.7,
    tags: ['educacao', 'matematica', 'ciencias']
  },
  {
    id: '5',
    nome: 'Carlos Lima',
    email: 'carlos@example.com',
    bio: 'Streamer profissional de jogos competitivos. Especialista em FPS e estratégia.',
    avatar: '/avatars/carlos.jpg',
    categoria: 'gaming',
    status: 'suspenso',
    nivel: '4',
    seguidores: 18700,
    doacoesRecebidas: 2890,
    totalSementes: 145000,
    dataCriacao: new Date('2024-01-20'),
    dataAprovacao: new Date('2024-01-25'),
    redesSociais: {
      twitch: 'https://twitch.tv/carloslima',
      youtube: 'https://youtube.com/@carloslima'
    },
    estatisticas: {
      visualizacoes: 1560000,
      likes: 52000,
      comentarios: 8900,
      compartilhamentos: 2100
    },
    conteudos: [
      {
        id: '5',
        titulo: 'Stream: CS2 Ranked',
        tipo: 'stream',
        url: 'https://twitch.tv/carloslima',
        thumbnail: '/thumbnails/stream1.jpg',
        visualizacoes: 89000,
        likes: 3400,
        dataCriacao: new Date('2024-07-11'),
        status: 'suspenso'
      }
    ],
    avaliacao: 4.5,
    tags: ['gaming', 'fps', 'competitivo']
  }
]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Simular delay de rede
      setTimeout(() => {
        res.status(200).json({
          success: true,
          criadores: criadoresMock,
          total: criadoresMock.length
        })
      }, 500)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({
      success: false,
      message: `Método ${req.method} não permitido`
    })
  }
} 