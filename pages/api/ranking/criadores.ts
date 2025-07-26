import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Buscar todos os criadores com suas doações recebidas
    const criadores = await prisma.usuario.findMany({
      where: {
        nivel: {
          in: ['criador', 'parceiro', 'supremo']
        }
      },
      include: {
        doacoesRecebidas: true,
        missaoUsuarios: {
          where: {
            concluida: true
          }
        },
        conquistaUsuarios: {
          where: {
            desbloqueada: true
          }
        }
      }
    })

    // Calcular pontuação composta para cada criador
    const criadoresComPontuacao = criadores.map(criador => {
      // Pontuação base: sementes recebidas (1 semente = 1 ponto)
      const sementesRecebidas = criador.doacoesRecebidas.reduce((total, doacao) => total + doacao.quantidade, 0)
      
      // Pontos extras por missões completadas (10 pontos por missão)
      const pontosMissoes = criador.missaoUsuarios.length * 10
      
      // Pontos extras por conquistas desbloqueadas (20 pontos por conquista)
      const pontosConquistas = criador.conquistaUsuarios.length * 20
      
      // Pontos do campo pontuacao do usuário (se existir)
      const pontosUsuario = criador.pontuacao || 0
      
      // Pontuação total composta
      const pontuacaoTotal = sementesRecebidas + pontosMissoes + pontosConquistas + pontosUsuario

      return {
        id: criador.id,
        nome: criador.nome,
        email: criador.email,
        avatar: criador.avatar,
        nivel: criador.nivel,
        sementesRecebidas,
        pontosMissoes,
        pontosConquistas,
        pontosUsuario,
        pontuacaoTotal,
        totalDoacoes: criador.doacoesRecebidas.length,
        missoesCompletadas: criador.missaoUsuarios.length,
        conquistasDesbloqueadas: criador.conquistaUsuarios.length
      }
    })

    // Ordenar por pontuação total (maior para menor)
    criadoresComPontuacao.sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal)

    // Definir nível dinâmico por posição no ranking
    const rankingComNivel = criadoresComPontuacao.map((criador, index) => {
      const posicao = index + 1
      let nivelRanking = 'comum'
      
      if (posicao <= 50) {
        nivelRanking = 'supremo'
      } else if (posicao <= 100) {
        nivelRanking = 'parceiro'
      } else if (posicao <= 150) {
        nivelRanking = 'criador'
      } else {
        nivelRanking = 'comum'
      }

      return {
        ...criador,
        posicao,
        nivelRanking
      }
    })

    // Retornar apenas os top 200 criadores
    const topCriadores = rankingComNivel.slice(0, 200)

    res.status(200).json({
      success: true,
      criadores: topCriadores,
      total: topCriadores.length
    })

  } catch (error) {
    console.error('Erro ao buscar ranking de criadores:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 