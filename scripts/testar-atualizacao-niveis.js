const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testarAtualizacaoNiveis() {
  console.log('🧪 Testando atualização automática de níveis...')

  try {
    // Buscar criadores antes da atualização
    const criadoresAntes = await prisma.criador.findMany({
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
            nivel: true,
            pontuacao: true
          }
        },
        doacoesRecebidas: true
      }
    })

    console.log(`\n📊 Criadores encontrados: ${criadoresAntes.length}`)
    
    // Mostrar níveis atuais
    const niveisAtuais = {}
    criadoresAntes.forEach(criador => {
      const nivel = criador.usuario.nivel
      niveisAtuais[nivel] = (niveisAtuais[nivel] || 0) + 1
    })

    console.log('\n📈 Níveis atuais:')
    Object.entries(niveisAtuais).forEach(([nivel, quantidade]) => {
      console.log(`- ${nivel}: ${quantidade} criadores`)
    })

    // Calcular pontuações
    const criadoresComPontuacao = criadoresAntes.map(criador => {
      const sementesRecebidas = criador.doacoesRecebidas.reduce((total, doacao) => total + doacao.quantidade, 0)
      const pontuacaoTotal = sementesRecebidas + (criador.usuario.pontuacao || 0)
      
      return {
        id: criador.usuario.id,
        nome: criador.usuario.nome,
        nivelAtual: criador.usuario.nivel,
        pontuacaoTotal,
        sementesRecebidas
      }
    })

    // Ordenar por pontuação
    criadoresComPontuacao.sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal)

    console.log('\n🏆 Top 10 criadores por pontuação:')
    criadoresComPontuacao.slice(0, 10).forEach((criador, index) => {
      const posicao = index + 1
      let nivelEsperado = 'criador-iniciante'
      
      if (posicao >= 1 && posicao <= 50) {
        nivelEsperado = 'criador-supremo'
      } else if (posicao >= 51 && posicao <= 100) {
        nivelEsperado = 'criador-parceiro'
      } else if (posicao >= 101 && posicao <= 150) {
        nivelEsperado = 'criador-comum'
      }

      const precisaAtualizar = criador.nivelAtual !== nivelEsperado
      const status = precisaAtualizar ? '⚠️  PRECISA ATUALIZAR' : '✅ OK'
      
      console.log(`${posicao}. ${criador.nome} - ${criador.pontuacaoTotal} pontos (${criador.nivelAtual} → ${nivelEsperado}) ${status}`)
    })

    // Simular atualização
    console.log('\n🔄 Simulando atualização de níveis...')
    let atualizacoes = 0

    for (let i = 0; i < criadoresComPontuacao.length; i++) {
      const criador = criadoresComPontuacao[i]
      const posicao = i + 1
      let novoNivel = 'criador-iniciante'
      
      if (posicao >= 1 && posicao <= 50) {
        novoNivel = 'criador-supremo'
      } else if (posicao >= 51 && posicao <= 100) {
        novoNivel = 'criador-parceiro'
      } else if (posicao >= 101 && posicao <= 150) {
        novoNivel = 'criador-comum'
      }

      if (criador.nivelAtual !== novoNivel) {
        console.log(`✅ ${criador.nome}: ${criador.nivelAtual} → ${novoNivel} (posição #${posicao})`)
        atualizacoes++
      }
    }

    console.log(`\n📊 Resumo da simulação:`)
    console.log(`- Total de criadores: ${criadoresComPontuacao.length}`)
    console.log(`- Criadores que precisam de atualização: ${atualizacoes}`)
    console.log(`- Criadores que estão corretos: ${criadoresComPontuacao.length - atualizacoes}`)

    if (atualizacoes > 0) {
      console.log('\n🚀 Para aplicar as atualizações, execute:')
      console.log('npm run atualizar-niveis')
      console.log('ou acesse: /api/ranking/atualizar-niveis-automatico')
    } else {
      console.log('\n🎉 Todos os criadores já estão com os níveis corretos!')
    }

  } catch (error) {
    console.error('❌ Erro ao testar atualização de níveis:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testarAtualizacaoNiveis()
}

module.exports = { testarAtualizacaoNiveis }
