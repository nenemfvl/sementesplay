import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Por enquanto, retornar dados mockados
    // Em produção, você criaria tabelas de missões no banco
    const missoes = [
      {
        id: '1',
        titulo: 'Primeira Doação',
        descricao: 'Faça sua primeira doação para um criador',
        tipo: 'diaria' as const,
        categoria: 'doacao' as const,
        objetivo: 1,
        progresso: 0,
        recompensa: {
          sementes: 100,
          experiencia: 50,
          badge: 'Doador Iniciante'
        },
        status: 'disponivel' as const,
        dataInicio: new Date(),
        dataFim: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        icone: '💝',
        cor: 'red'
      },
      {
        id: '2',
        titulo: 'Doador Generoso',
        descricao: 'Doa 500 Sementes em um dia',
        tipo: 'diaria' as const,
        categoria: 'doacao' as const,
        objetivo: 500,
        progresso: 250,
        recompensa: {
          sementes: 200,
          experiencia: 100,
          badge: 'Doador Generoso'
        },
        status: 'em_progresso' as const,
        dataInicio: new Date(),
        dataFim: new Date(Date.now() + 24 * 60 * 60 * 1000),
        icone: '🎁',
        cor: 'green'
      },
      {
        id: '3',
        titulo: 'Social Butterfly',
        descricao: 'Adicione 5 amigos',
        tipo: 'semanal' as const,
        categoria: 'social' as const,
        objetivo: 5,
        progresso: 3,
        recompensa: {
          sementes: 300,
          experiencia: 150,
          badge: 'Social Butterfly'
        },
        status: 'em_progresso' as const,
        dataInicio: new Date(),
        dataFim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        icone: '🦋',
        cor: 'blue'
      },
      {
        id: '4',
        titulo: 'Chat Ativo',
        descricao: 'Envie 10 mensagens no chat',
        tipo: 'diaria' as const,
        categoria: 'social' as const,
        objetivo: 10,
        progresso: 10,
        recompensa: {
          sementes: 150,
          experiencia: 75,
          badge: 'Comunicador'
        },
        status: 'completada' as const,
        dataInicio: new Date(),
        dataFim: new Date(Date.now() + 24 * 60 * 60 * 1000),
        icone: '💬',
        cor: 'purple'
      },
      {
        id: '5',
        titulo: 'Top Doador',
        descricao: 'Fique no top 10 do ranking de doadores',
        tipo: 'mensal' as const,
        categoria: 'ranking' as const,
        objetivo: 1,
        progresso: 0,
        recompensa: {
          sementes: 1000,
          experiencia: 500,
          badge: 'Top Doador'
        },
        status: 'disponivel' as const,
        dataInicio: new Date(),
        dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        icone: '🏆',
        cor: 'yellow'
      },
      {
        id: '6',
        titulo: 'Missão Especial',
        descricao: 'Complete 5 missões diárias em uma semana',
        tipo: 'especial' as const,
        categoria: 'sistema' as const,
        objetivo: 5,
        progresso: 2,
        recompensa: {
          sementes: 500,
          experiencia: 250,
          badge: 'Missão Master'
        },
        status: 'em_progresso' as const,
        dataInicio: new Date(),
        dataFim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        icone: '⭐',
        cor: 'orange'
      },
      {
        id: '7',
        titulo: 'Criador Apoiado',
        descricao: 'Doa para 3 criadores diferentes',
        tipo: 'semanal' as const,
        categoria: 'criador' as const,
        objetivo: 3,
        progresso: 1,
        recompensa: {
          sementes: 400,
          experiencia: 200,
          badge: 'Apoiador'
        },
        status: 'em_progresso' as const,
        dataInicio: new Date(),
        dataFim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        icone: '👨‍🎨',
        cor: 'pink'
      },
      {
        id: '8',
        titulo: 'Login Diário',
        descricao: 'Faça login por 7 dias consecutivos',
        tipo: 'semanal' as const,
        categoria: 'sistema' as const,
        objetivo: 7,
        progresso: 4,
        recompensa: {
          sementes: 250,
          experiencia: 125,
          badge: 'Fiel'
        },
        status: 'em_progresso' as const,
        dataInicio: new Date(),
        dataFim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        icone: '📅',
        cor: 'cyan'
      }
    ]

    return res.status(200).json({ missoes })
  } catch (error) {
    console.error('Erro ao buscar missões:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 