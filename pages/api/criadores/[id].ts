import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID do criador é obrigatório' })
    }

    // Buscar o criador com dados do usuário
    const criador = await prisma.criador.findUnique({
      where: { id },
      include: {
        usuario: {
          include: {
            missoes: true,
            conquistas: true
          }
        }
      }
    })

    if (!criador) {
      return res.status(404).json({ error: 'Criador não encontrado' })
    }

    // Buscar estatísticas de doações
    const doacoes = await prisma.doacao.findMany({
      where: { criadorId: id },
      include: { doador: true }
    })

    const totalDoacoes = doacoes.length
    const sementesRecebidas = doacoes.reduce((sum, doacao) => sum + doacao.quantidade, 0)
    const apoiadoresUnicos = new Set(doacoes.map(d => d.doadorId)).size

    // Calcular pontuação total
    const pontosMissoes = criador.usuario.missoes.length * 10
    const pontosConquistas = criador.usuario.conquistas.length * 50
    const pontosUsuario = criador.usuario.pontuacao || 0
    const pontuacaoTotal = pontosMissoes + pontosConquistas + pontosUsuario

    // Buscar posição no ranking
    const todosCriadores = await prisma.criador.findMany({
      include: {
        usuario: {
          include: {
            missoes: true,
            conquistas: true
          }
        }
      }
    })

    const criadoresComPontuacao = todosCriadores.map(c => {
      const doacoesCriador = doacoes.filter(d => d.criadorId === c.id)
      const pontuacaoCriador = (c.usuario.missoes.length * 10) + (c.usuario.conquistas.length * 50) + (c.usuario.pontuacao || 0)
      return { ...c, pontuacao: pontuacaoCriador }
    })

    criadoresComPontuacao.sort((a, b) => b.pontuacao - a.pontuacao)
    const posicao = criadoresComPontuacao.findIndex(c => c.id === id) + 1

    // Mapear nível do banco para nome descritivo
    const mapearNivel = (nivel: string) => {
      switch (nivel) {
        case 'comum':
          return 'Comum'
        case 'criador-iniciante':
          return 'Criador Iniciante'
        case 'criador-comum':
          return 'Criador Comum'
        case 'criador-parceiro':
          return 'Criador Parceiro'
        case 'criador-supremo':
          return 'Criador Supremo'
        case 'parceiro':
          return 'Parceiro'
        case 'supremo':
          return 'Supremo'
        default:
          return 'Comum'
      }
    }

    // Definir nível dinâmico por posição no ranking
    let nivelRanking = 'comum'
    if (posicao <= 50) {
      nivelRanking = 'Supremo'
    } else if (posicao <= 100) {
      nivelRanking = 'Parceiro'
    } else if (posicao <= 150) {
      nivelRanking = 'Criador'
    } else {
      nivelRanking = 'Comum'
    }

    const criadorFormatado = {
      id: criador.id,
      nome: criador.usuario.nome,
      avatar: criador.usuario.avatarUrl || '👨‍🎨',
      nivel: mapearNivel(criador.usuario.nivel),
      nivelRanking,
      sementes: criador.usuario.sementes,
      sementesRecebidas,
      pontosMissoes,
      pontosConquistas,
      pontosUsuario,
      pontuacaoTotal,
      doacoes: totalDoacoes,
      missoesCompletadas: criador.usuario.missoes.length,
      conquistasDesbloqueadas: criador.usuario.conquistas.length,
      posicao,
      usuarioId: criador.usuarioId,
      redesSociais: criador.redesSociais ? JSON.parse(criador.redesSociais) : {}
    }

    res.status(200).json({
      success: true,
      criador: criadorFormatado
    })
  } catch (error) {
    console.error('Erro ao buscar criador:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 