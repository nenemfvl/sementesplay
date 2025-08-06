// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// async function verificarSementes() {
  console.log('🔍 Verificando contabilização de sementes...')

  try {
    // 1. Total de sementes na tabela usuarios
    const totalSementesUsuarios = await prisma.usuario.aggregate({
      _sum: {
        sementes: true
      }
    })

    // 2. Total de sementes na tabela criadores
    const totalSementesCriadores = await prisma.criador.aggregate({
      _sum: {
        sementes: true
      }
    })

    // 3. Histórico de sementes por tipo
    const historicoPorTipo = await prisma.semente.groupBy({
      by: ['tipo'],
      _sum: {
        quantidade: true
      }
    })

    // 4. Total de doações
    const totalDoacoes = await prisma.doacao.aggregate({
      _sum: {
        quantidade: true
      }
    })

    // 5. Total de pagamentos (sementes geradas)
    const totalPagamentos = await prisma.pagamento.aggregate({
      _sum: {
        sementesGeradas: true
      }
    })

    // 6. Total de saques (sementes convertidas)
    const totalSaques = await prisma.saque.aggregate({
      _sum: {
        valor: true
      }
    })

    console.log('\n📊 RESUMO DA CONTABILIZAÇÃO:')
    console.log('='.repeat(50))
    console.log(`💰 Sementes em usuários: ${totalSementesUsuarios._sum.sementes || 0}`)
    console.log(`🎭 Sementes em criadores: ${totalSementesCriadores._sum.sementes || 0}`)
    console.log(`📈 Total geral: ${(totalSementesUsuarios._sum.sementes || 0) + (totalSementesCriadores._sum.sementes || 0)}`)
    
    console.log('\n📋 HISTÓRICO POR TIPO:')
    historicoPorTipo.forEach(item => {
      console.log(`   ${item.tipo}: ${item._sum.quantidade || 0}`)
    })

    console.log('\n🔄 MOVIMENTAÇÕES:')
    console.log(`   Doações totais: ${totalDoacoes._sum.quantidade || 0}`)
    console.log(`   Sementes geradas por pagamentos: ${totalPagamentos._sum.sementesGeradas || 0}`)
    console.log(`   Valor total de saques: ${totalSaques._sum.valor || 0}`)

    // 7. Verificar se há inconsistências
    const totalGeradas = historicoPorTipo.find(h => h.tipo === 'gerada')?._sum.quantidade || 0
    const totalDoadas = historicoPorTipo.find(h => h.tipo === 'doacao')?._sum.quantidade || 0
    const totalRecebidas = historicoPorTipo.find(h => h.tipo === 'recebida')?._sum.quantidade || 0
    const totalResgatadas = historicoPorTipo.find(h => h.tipo === 'resgatada')?._sum.quantidade || 0
    const totalSaquesHist = historicoPorTipo.find(h => h.tipo === 'saque')?._sum.quantidade || 0

    const totalEntrada = totalGeradas + totalRecebidas + totalResgatadas
    const totalSaida = Math.abs(totalDoadas) + Math.abs(totalSaquesHist)
    const saldoCalculado = totalEntrada - totalSaida
    const saldoReal = (totalSementesUsuarios._sum.sementes || 0) + (totalSementesCriadores._sum.sementes || 0)

    console.log('\n⚖️  VERIFICAÇÃO DE SALDO:')
    console.log(`   Total entrada: ${totalEntrada}`)
    console.log(`   Total saída: ${totalSaida}`)
    console.log(`   Saldo calculado: ${saldoCalculado}`)
    console.log(`   Saldo real: ${saldoReal}`)
    console.log(`   Diferença: ${saldoReal - saldoCalculado}`)

    if (saldoReal !== saldoCalculado) {
      console.log('\n⚠️  ATENÇÃO: Há inconsistência na contabilização!')
    } else {
      console.log('\n✅ Contabilização está correta!')
    }

//   } catch (error) {
//     console.error('❌ Erro ao verificar sementes:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// // Executar se chamado diretamente
// if (require.main === module) {
//   verificarSementes()
//     .then(() => {
//       console.log('\n✅ Verificação concluída!')
//       process.exit(0)
//     })
//     .catch((error) => {
//       console.error('❌ Erro ao executar verificação:', error)
//       process.exit(1)
//     })
// }

// module.exports = { verificarSementes } 