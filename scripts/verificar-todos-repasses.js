// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// async function verificarTodosRepasses() {
  console.log('🔍 Verificando todos os repasses...')

  try {
    // Buscar todos os repasses
    const todosRepasses = await prisma.repasseParceiro.findMany({
      include: {
        compra: {
          include: {
            usuario: true,
            parceiro: true
          }
        }
      },
      orderBy: {
        dataRepasse: 'desc'
      }
    })

    console.log(`\n📊 Total de repasses: ${todosRepasses.length}`)

    let totalValorRepasses = 0
    let totalSementesDistribuidas = 0
    let totalFundoAcumulado = 0

    for (const repasse of todosRepasses) {
      console.log(`\n🔍 Repasse ID: ${repasse.id}`)
      console.log(`   Status: ${repasse.status}`)
      console.log(`   Valor: R$ ${repasse.valor}`)
      console.log(`   Usuário: ${repasse.compra.usuario.nome}`)
      console.log(`   Parceiro: ${repasse.compra.parceiro.nome}`)
      console.log(`   Data: ${repasse.dataRepasse.toLocaleString()}`)

      // Calcular distribuição esperada
      const pctUsuario = Math.round(repasse.valor * 0.05)    // 5% para jogador
      const pctFundo = repasse.valor * 0.025                 // 2,5% para fundo

      console.log(`   📊 Distribuição esperada:`)
      console.log(`      • Usuário: ${pctUsuario} sementes (5%)`)
      console.log(`      • Fundo: R$ ${pctFundo.toFixed(2)} (2,5%)`)

      if (repasse.status === 'confirmado') {
        totalValorRepasses += repasse.valor
        totalSementesDistribuidas += pctUsuario
        totalFundoAcumulado += pctFundo

        // Verificar se o usuário recebeu as sementes
        const usuario = await prisma.usuario.findUnique({
          where: { id: repasse.compra.usuarioId }
        })

        console.log(`   💰 Sementes atuais do usuário: ${usuario.sementes}`)

        // Verificar histórico de sementes
        const historicoSementes = await prisma.semente.findMany({
          where: {
            usuarioId: repasse.compra.usuarioId,
            descricao: {
              contains: `Cashback compra parceiro ${repasse.compraId}`
            }
          }
        })

        if (historicoSementes.length > 0) {
          console.log(`   ✅ Histórico encontrado: ${historicoSementes[0].quantidade} sementes`)
        } else {
          console.log(`   ❌ Histórico NÃO encontrado!`)
        }
      } else {
        console.log(`   ⏸️  Repasse não confirmado`)
      }
    }

    console.log(`\n📈 RESUMO GERAL:`)
    console.log(`   Total de repasses confirmados: ${todosRepasses.filter(r => r.status === 'confirmado').length}`)
    console.log(`   Valor total dos repasses: R$ ${totalValorRepasses.toFixed(2)}`)
    console.log(`   Total de sementes distribuídas: ${totalSementesDistribuidas}`)
    console.log(`   Total acumulado no fundo: R$ ${totalFundoAcumulado.toFixed(2)}`)

    // Verificar fundo atual
    const fundoAtual = await prisma.fundoSementes.findFirst({
      where: { distribuido: false }
    })

    console.log(`\n💰 Fundo de sementes atual:`)
    if (fundoAtual) {
      console.log(`   Valor total: R$ ${fundoAtual.valorTotal.toFixed(2)}`)
      console.log(`   Diferença esperada vs real: R$ ${(totalFundoAcumulado - fundoAtual.valorTotal).toFixed(2)}`)
    } else {
      console.log(`   Nenhum fundo pendente`)
    }

    // Verificar total de sementes em circulação
    const totalSementes = await prisma.usuario.aggregate({
      _sum: {
        sementes: true
      }
    })

    console.log(`\n🌱 Total de sementes em circulação: ${totalSementes._sum.sementes || 0}`)
    console.log(`   Diferença esperada vs real: ${totalSementesDistribuidas - (totalSementes._sum.sementes || 0)}`)

//   } catch (error) {
//     console.error('❌ Erro durante verificação:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// verificarTodosRepasses() 