const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarPosicaoCriador() {
  try {
    console.log('🔍 Verificando posição do criador "van"...')

    // Buscar o criador van
    const criador = await prisma.criador.findFirst({
      where: {
        usuario: {
          nome: 'van'
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

    if (!criador) {
      console.log('❌ Criador "van" não encontrado')
      return
    }

    console.log(`✅ Criador encontrado: ${criador.usuario.nome}`)
    console.log(`   - Sementes disponíveis: ${criador.usuario.sementes}`)
    console.log(`   - Doações recebidas: ${criador.doacoesRecebidas.length}`)
    console.log(`   - Missões completadas: ${criador.usuario.missaoUsuarios.length}`)
    console.log(`   - Conquistas: ${criador.usuario.conquistas.length}`)
    console.log(`   - Pontuação do usuário: ${criador.usuario.pontuacao || 0}`)

    // Calcular pontuação do van
    const sementesRecebidas = criador.doacoesRecebidas.reduce((total, doacao) => total + doacao.quantidade, 0)
    const pontosMissoes = criador.usuario.missaoUsuarios.length * 10
    const pontosConquistas = criador.usuario.conquistas.length * 20
    const pontosUsuario = criador.usuario.pontuacao || 0
    const pontuacaoTotal = sementesRecebidas + pontosMissoes + pontosConquistas + pontosUsuario

    console.log(`\n📊 Pontuação do van:`)
    console.log(`   - Sementes recebidas: ${sementesRecebidas} pontos`)
    console.log(`   - Missões completadas: ${pontosMissoes} pontos`)
    console.log(`   - Conquistas: ${pontosConquistas} pontos`)
    console.log(`   - Pontuação do usuário: ${pontosUsuario} pontos`)
    console.log(`   - TOTAL: ${pontuacaoTotal} pontos`)

    // Buscar todos os criadores para calcular ranking
    const todosCriadores = await prisma.criador.findMany({
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

    // Calcular pontuação de todos os criadores
    const criadoresComPontuacao = todosCriadores.map(c => {
      const sementesRecebidas = c.doacoesRecebidas.reduce((total, doacao) => total + doacao.quantidade, 0)
      const pontosMissoes = c.usuario.missaoUsuarios.length * 10
      const pontosConquistas = c.usuario.conquistas.length * 20
      const pontosUsuario = c.usuario.pontuacao || 0
      const pontuacaoTotal = sementesRecebidas + pontosMissoes + pontosConquistas + pontosUsuario
      
      return {
        id: c.id,
        nome: c.usuario.nome,
        pontuacaoTotal,
        sementesRecebidas,
        pontosMissoes,
        pontosConquistas,
        pontosUsuario
      }
    })

    // Ordenar por pontuação total (maior para menor)
    criadoresComPontuacao.sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal)

    // Encontrar posição do van
    const posicao = criadoresComPontuacao.findIndex(item => item.id === criador.id) + 1

    console.log(`\n🏆 RANKING COMPLETO:`)
    criadoresComPontuacao.forEach((c, index) => {
      const pos = index + 1
      const emoji = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : `${pos}º`
      console.log(`${emoji} ${c.nome}: ${c.pontuacaoTotal} pontos (${c.sementesRecebidas} doações + ${c.pontosMissoes} missões + ${c.pontosConquistas} conquistas + ${c.pontosUsuario} usuário)`)
    })

    console.log(`\n🎯 POSIÇÃO DO VAN: ${posicao}º lugar`)
    console.log(`   - Pontuação: ${pontuacaoTotal} pontos`)

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  verificarPosicaoCriador()
    .then(() => {
      console.log('\n✅ Verificação concluída!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erro ao executar script:', error)
      process.exit(1)
    })
}

module.exports = { verificarPosicaoCriador } 