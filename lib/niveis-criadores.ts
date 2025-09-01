import { prisma } from './prisma'

// Função para determinar o nível baseado na posição no ranking
export function determinarNivelPorPosicao(posicao: number): string {
  if (posicao >= 1 && posicao <= 50) {
    return 'criador-supremo'
  } else if (posicao >= 51 && posicao <= 100) {
    return 'criador-parceiro'
  } else if (posicao >= 101 && posicao <= 150) {
    return 'criador-comum'
  } else {
    return 'criador-iniciante'
  }
}

// Função para calcular pontuação de um criador
export function calcularPontuacaoCriador(criador: any): number {
  // Pontuação base: sementes recebidas (1 semente = 1 ponto)
  const sementesRecebidas = criador.doacoesRecebidas?.reduce((total: number, doacao: any) => total + doacao.quantidade, 0) || 0
  
  // Pontos extras por missões completadas (10 pontos por missão)
  const pontosMissoes = criador.usuario?.missaoUsuarios?.length * 10 || 0
  
  // Pontos extras por conquistas desbloqueadas (20 pontos por conquista)
  const pontosConquistas = criador.usuario?.conquistas?.length * 20 || 0
  
  // Pontos do campo pontuacao do usuário (se existir)
  const pontosUsuario = criador.usuario?.pontuacao || 0
  
  // Pontuação total composta
  return sementesRecebidas + pontosMissoes + pontosConquistas + pontosUsuario
}

// Função principal para atualizar níveis de todos os criadores
export async function atualizarNiveisCriadores(): Promise<{
  success: boolean
  message: string
  atualizacoes: any[]
  totalCriadores: number
}> {
  try {
    console.log('🔄 Iniciando atualização automática de níveis de criadores...')

    // Buscar todos os criadores que tenham pelo menos 1 conteúdo postado
    const criadores = await prisma.criador.findMany({
      where: {
        usuario: {
          nivel: {
            in: ['criador-supremo', 'criador-parceiro', 'criador-comum', 'criador-iniciante']
          }
        },
        conteudos: {
          some: {} // Garante que o criador tenha pelo menos 1 conteúdo
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

    console.log(`📊 Encontrados ${criadores.length} criadores`)

    // Calcular pontuação para cada criador
    const criadoresComPontuacao = criadores.map(criador => ({
      id: criador.usuario.id,
      nome: criador.usuario.nome,
      nivelAtual: criador.usuario.nivel,
      pontuacaoTotal: calcularPontuacaoCriador(criador)
    }))

    // Ordenar por pontuação total (maior para menor)
    criadoresComPontuacao.sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal)

    // Atualizar níveis baseado na posição no ranking
    const atualizacoes = []
    
    for (let i = 0; i < criadoresComPontuacao.length; i++) {
      const criador = criadoresComPontuacao[i]
      const posicao = i + 1
      const novoNivel = determinarNivelPorPosicao(posicao)

      // Só atualizar se o nível mudou
      if (criador.nivelAtual !== novoNivel) {
        await prisma.usuario.update({
          where: { id: criador.id },
          data: { nivel: novoNivel }
        })
        
        atualizacoes.push({
          id: criador.id,
          nome: criador.nome,
          posicao,
          nivelAnterior: criador.nivelAtual,
          nivelNovo: novoNivel,
          pontuacao: criador.pontuacaoTotal
        })

        console.log(`✅ ${criador.nome}: ${criador.nivelAtual} → ${novoNivel} (posição #${posicao})`)
      }
    }

    console.log(`🎉 Atualização concluída! ${atualizacoes.length} criadores tiveram seus níveis atualizados.`)

    return {
      success: true,
      message: `Níveis atualizados para ${atualizacoes.length} criadores`,
      atualizacoes,
      totalCriadores: criadores.length
    }

  } catch (error) {
    console.error('❌ Erro ao atualizar níveis de criadores:', error)
    return {
      success: false,
      message: 'Erro ao atualizar níveis',
      atualizacoes: [],
      totalCriadores: 0
    }
  }
}

// Função para atualizar nível de um criador específico
export async function atualizarNivelCriador(criadorId: string): Promise<boolean> {
  try {
    // Buscar o criador
    const criador = await prisma.criador.findUnique({
      where: { id: criadorId },
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

    if (!criador) {
      console.error(`Criador não encontrado: ${criadorId}`)
      return false
    }

    // Buscar todos os criadores para calcular a posição (apenas os que têm conteúdo)
    const todosCriadores = await prisma.criador.findMany({
      where: {
        usuario: {
          nivel: {
            in: ['criador-supremo', 'criador-parceiro', 'criador-comum', 'criador-iniciante']
          }
        },
        conteudos: {
          some: {} // Garante que o criador tenha pelo menos 1 conteúdo
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

    // Calcular pontuações e ordenar
    const criadoresComPontuacao = todosCriadores.map(c => ({
      id: c.usuario.id,
      pontuacaoTotal: calcularPontuacaoCriador(c)
    }))

    criadoresComPontuacao.sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal)

    // Encontrar posição do criador
    const posicao = criadoresComPontuacao.findIndex(c => c.id === criadorId) + 1
    const novoNivel = determinarNivelPorPosicao(posicao)

    // Atualizar se necessário
    if (criador.usuario.nivel !== novoNivel) {
      await prisma.usuario.update({
        where: { id: criadorId },
        data: { nivel: novoNivel }
      })

      console.log(`✅ ${criador.usuario.nome}: ${criador.usuario.nivel} → ${novoNivel} (posição #${posicao})`)
      return true
    }

    return false

  } catch (error) {
    console.error('Erro ao atualizar nível do criador:', error)
    return false
  }
}
