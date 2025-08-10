import { prisma } from '../../../lib/prisma'

import { NextApiRequest, NextApiResponse } from 'next'
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
            missaoUsuarios: {
              include: {
                missao: true
              }
            },
            conquistas: {
              include: {
                conquista: true
              }
            }
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

    // Calcular pontuação total (EXATAMENTE igual à API de ranking)
    const missoesConcluidas = criador.usuario.missaoUsuarios.filter(mu => mu.concluida).length
    const conquistasDesbloqueadas = criador.usuario.conquistas.length
    const pontosMissoes = missoesConcluidas * 10
    const pontosConquistas = conquistasDesbloqueadas * 20
    const pontosUsuario = criador.usuario.pontuacao || 0

    // Buscar dados adicionais (mesmo que a API de ranking)
    const [conteudos, enquetes, recadosPublicos] = await Promise.all([
      // Total de visualizações dos conteúdos
      prisma.conteudo.aggregate({
        where: { criadorId: criador.id },
        _sum: { visualizacoes: true }
      }).catch(() => ({ _sum: { visualizacoes: 0 } })),
      
      // Quantidade de enquetes criadas
      prisma.enquete.count({
        where: { criadorId: criador.usuarioId }
      }).catch(() => 0),
      
      // Quantidade de recados públicos (caixa de perguntas)
      prisma.recado.count({
        where: { 
          destinatarioId: criador.usuarioId,
          publico: true 
        }
      }).catch(() => 0)
    ])
    
    // Calcular pontuação por visualizações (1 visualização = 0.1 ponto)
    const pontosVisualizacoes = Math.floor((conteudos._sum.visualizacoes || 0) * 0.1)
    
    // Pontos por enquetes (5 pontos por enquete)
    const pontosEnquetes = enquetes * 5
    
    // Pontos por recados públicos (2 pontos por recado público)
    const pontosRecadosPublicos = recadosPublicos * 2

    // Pontuação total composta (EXATAMENTE igual à API de ranking)
    const pontuacaoTotal = sementesRecebidas + pontosUsuario + pontosVisualizacoes + pontosEnquetes + pontosRecadosPublicos

    // Buscar posição no ranking usando EXATAMENTE o mesmo critério da API de ranking
    const ranking = await prisma.criador.findMany({
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
            avatarUrl: true,
            nivel: true,
            pontuacao: true,
            sementes: true
          }
        },
        doacoesRecebidas: {
          select: {
            quantidade: true
          }
        }
      }
    })

    // Calcular pontuação composta para cada criador (EXATAMENTE igual à API de ranking)
    const criadoresComPontuacao = await Promise.all(ranking.map(async c => {
      try {
        // Pontuação base: sementes recebidas (1 semente = 1 ponto)
        const sementesRecebidas = c.doacoesRecebidas.reduce((total, doacao) => total + doacao.quantidade, 0)
        
        // Pontos do campo pontuacao do usuário (se ele também doar)
        const pontosUsuario = c.usuario.pontuacao || 0
        
        // Buscar dados adicionais do criador (mesmo que a API de ranking)
        const [conteudos, enquetes, recadosPublicos] = await Promise.all([
          // Total de visualizações dos conteúdos
          prisma.conteudo.aggregate({
            where: { criadorId: c.id },
            _sum: { visualizacoes: true }
          }).catch(() => ({ _sum: { visualizacoes: 0 } })),
          
          // Quantidade de enquetes criadas
          prisma.enquete.count({
            where: { criadorId: c.usuarioId }
          }).catch(() => 0),
          
          // Quantidade de recados públicos (caixa de perguntas)
          prisma.recado.count({
            where: { 
              destinatarioId: c.usuarioId,
              publico: true 
            }
          }).catch(() => 0)
        ])
        
        // Calcular pontuação por visualizações (1 visualização = 0.1 ponto)
        const pontosVisualizacoes = Math.floor((conteudos._sum.visualizacoes || 0) * 0.1)
        
        // Pontos por enquetes (5 pontos por enquete)
        const pontosEnquetes = enquetes * 5
        
        // Pontos por recados públicos (2 pontos por recado público)
        const pontosRecadosPublicos = recadosPublicos * 2
        
        // Pontuação total composta (EXATAMENTE igual à página de status)
        const pontuacaoTotal = sementesRecebidas + pontosUsuario + pontosVisualizacoes + pontosEnquetes + pontosRecadosPublicos
        
        return {
          id: c.id,
          pontuacaoTotal
        }
      } catch (error) {
        console.error(`Erro ao calcular pontuação do criador ${c.id}:`, error)
        // Em caso de erro, usar pontuação básica
        const sementesRecebidas = c.doacoesRecebidas.reduce((total, doacao) => total + doacao.quantidade, 0)
        const pontosUsuario = c.usuario.pontuacao || 0
        return {
          id: c.id,
          pontuacaoTotal: sementesRecebidas + pontosUsuario
        }
      }
    }))

    // Ordenar por pontuação total (maior para menor)
    criadoresComPontuacao.sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal)

    const posicao = criadoresComPontuacao.findIndex(item => item.id === criador.id) + 1

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
      missoesCompletadas: missoesConcluidas,
      conquistasDesbloqueadas: conquistasDesbloqueadas,
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