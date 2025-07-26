import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Buscar todos os criadores com suas doações recebidas
    const criadores = await prisma.criador.findMany({
      include: {
        usuario: {
          include: {
            missaoUsuarios: {
              where: {
                concluida: true
              }
            },
            conquistas: true
          }
        },
        doacoesRecebidas: true
      }
    })

    // Calcular pontuação composta para cada criador
    const criadoresComPontuacao = criadores.map(criador => {
      // Pontuação base: sementes recebidas (1 semente = 1 ponto)
      const sementesRecebidas = criador.doacoesRecebidas.reduce((total, doacao) => total + doacao.quantidade, 0)
      
      // Pontos extras por missões completadas (10 pontos por missão)
      const pontosMissoes = criador.usuario.missaoUsuarios.length * 10
      
      // Pontos extras por conquistas desbloqueadas (20 pontos por conquista)
      const pontosConquistas = criador.usuario.conquistas.length * 20
      
      // Pontos do campo pontuacao do usuário (se existir)
      const pontosUsuario = criador.usuario.pontuacao || 0
      
      // Pontuação total composta
      const pontuacaoTotal = sementesRecebidas + pontosMissoes + pontosConquistas + pontosUsuario

      return {
        id: criador.usuario.id,
        nome: criador.usuario.nome,
        email: criador.usuario.email,
        avatar: criador.usuario.avatarUrl || '👤',
        nivel: criador.usuario.nivel,
        sementesRecebidas,
        pontosMissoes,
        pontosConquistas,
        pontosUsuario,
        pontuacaoTotal,
        totalDoacoes: criador.doacoesRecebidas.length,
        missoesCompletadas: criador.usuario.missaoUsuarios.length,
        conquistasDesbloqueadas: criador.usuario.conquistas.length,
        redesSociais: criador.redesSociais ? JSON.parse(criador.redesSociais) : {}
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