const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function atualizarNiveis() {
  console.log('🔄 Iniciando atualização automática de níveis...')

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

    console.log(`📊 Encontrados ${criadores.length} criadores`)

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
        nivelAtual: criador.usuario.nivel,
        pontuacaoTotal,
        sementesRecebidas,
        pontosMissoes,
        pontosConquistas,
        pontosUsuario
      }
    })

    // Ordenar por pontuação total (maior para menor)
    criadoresComPontuacao.sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal)

    console.log('\n🏆 Ranking dos criadores:')
    criadoresComPontuacao.slice(0, 10).forEach((criador, index) => {
      console.log(`${index + 1}. ${criador.nome} - ${criador.pontuacaoTotal} pontos (${criador.nivelAtual})`)
    })

    // Atualizar níveis baseado na posição no ranking
    let atualizados = 0
    
    for (let i = 0; i < criadoresComPontuacao.length; i++) {
      const criador = criadoresComPontuacao[i]
      const posicao = i + 1
      let novoNivel = 'comum'
      
      // Definir nível baseado na posição
      if (posicao <= 50) {
        novoNivel = 'supremo'
      } else if (posicao <= 100) {
        novoNivel = 'parceiro'
      } else if (posicao <= 150) {
        novoNivel = 'criador'
      } else {
        novoNivel = 'comum'
      }

      // Só atualizar se o nível mudou
      if (criador.nivelAtual !== novoNivel) {
        await prisma.usuario.update({
          where: { id: criador.id },
          data: { nivel: novoNivel }
        })
        
        console.log(`✅ ${criador.nome}: ${criador.nivelAtual} → ${novoNivel} (posição #${posicao})`)
        atualizados++
      }
    }

    console.log(`\n🎉 Atualização concluída! ${atualizados} criadores tiveram seus níveis atualizados.`)

    // Estatísticas finais
    const estatisticas = {
      supremo: criadoresComPontuacao.filter(c => c.nivelAtual === 'supremo').length,
      parceiro: criadoresComPontuacao.filter(c => c.nivelAtual === 'parceiro').length,
      criador: criadoresComPontuacao.filter(c => c.nivelAtual === 'criador').length,
      comum: criadoresComPontuacao.filter(c => c.nivelAtual === 'comum').length
    }

    console.log('\n📈 Estatísticas finais:')
    console.log(`- Supremo: ${estatisticas.supremo}`)
    console.log(`- Parceiro: ${estatisticas.parceiro}`)
    console.log(`- Criador: ${estatisticas.criador}`)
    console.log(`- Comum: ${estatisticas.comum}`)

  } catch (error) {
    console.error('❌ Erro ao atualizar níveis:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  atualizarNiveis()
}

module.exports = { atualizarNiveis } 