import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
         // Buscar apenas criadores com níveis específicos (excluindo admin nível 5)
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
      
      // Pontos do campo pontuacao do usuário (se ele também doar)
      const pontosUsuario = criador.usuario.pontuacao || 0
      
      // Buscar dados adicionais do criador
      const [conteudos, enquetes, recadosPublicos] = await Promise.all([
        // Total de visualizações dos conteúdos
        prisma.conteudo.aggregate({
          where: { criadorId: criador.id },
          _sum: { visualizacoes: true }
        }),
        
        // Quantidade de enquetes criadas
        prisma.enquete.count({
          where: { criadorId: criador.usuarioId }
        }),
        
        // Quantidade de recados públicos (caixa de perguntas)
        prisma.recado.count({
          where: { 
            destinatarioId: criador.usuarioId,
            publico: true 
          }
        })
      ])
      
      // Calcular pontuação por visualizações (1 visualização = 0.1 ponto)
      const pontosVisualizacoes = Math.floor((conteudos._sum.visualizacoes || 0) * 0.1)
      
      // Pontos por enquetes (5 pontos por enquete)
      const pontosEnquetes = enquetes * 5
      
      // Pontos por recados públicos (2 pontos por recado público)
      const pontosRecadosPublicos = recadosPublicos * 2
      
      // Pontuação total composta
      const pontuacaoTotal = sementesRecebidas + pontosUsuario + pontosVisualizacoes + pontosEnquetes + pontosRecadosPublicos

              return {
          id: criador.id,
          nome: criador.usuario.nome,
          email: criador.usuario.email,
          avatar: criador.usuario.avatarUrl || '👤',
          nivel: criador.usuario.nivel,
          sementes: criador.usuario.sementes, // Sementes que o usuário tem no perfil
          sementesRecebidas,
          pontosUsuario,
          pontosVisualizacoes,
          pontosEnquetes,
          pontosRecadosPublicos,
          pontuacaoTotal,
          totalDoacoes: criador.doacoesRecebidas.length,
          totalVisualizacoes: conteudos._sum.visualizacoes || 0,
          totalEnquetes: enquetes,
          totalRecadosPublicos: recadosPublicos,
          redesSociais: criador.redesSociais ? JSON.parse(criador.redesSociais) : {}
        }
    })

    // Ordenar por pontuação total (maior para menor)
    criadoresComPontuacao.sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal)

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

    // Definir nível dinâmico por posição no ranking (apenas para badge)
    const rankingComNivel = criadoresComPontuacao.map((criador, index) => {
      const posicao = index + 1
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

      return {
        ...criador,
        posicao,
        nivelRanking,
        nivel: mapearNivel(criador.nivel) // Usar o nível real do banco
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