const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarFundos() {
  console.log('🔍 Verificando todos os fundos de sementes...')

  try {
    // Buscar todos os fundos
    const todosFundos = await prisma.fundoSementes.findMany({
      include: {
        distribuicoes: true
      },
      orderBy: {
        dataInicio: 'desc'
      }
    })

    console.log(`\n📊 Total de fundos: ${todosFundos.length}`)

    for (const fundo of todosFundos) {
      console.log(`\n🔍 Fundo ID: ${fundo.id}`)
      console.log(`   Ciclo: ${fundo.ciclo}`)
      console.log(`   Valor total: R$ ${fundo.valorTotal.toFixed(2)}`)
      console.log(`   Data início: ${fundo.dataInicio.toLocaleString()}`)
      console.log(`   Data fim: ${fundo.dataFim.toLocaleString()}`)
      console.log(`   Distribuído: ${fundo.distribuido ? 'Sim' : 'Não'}`)
      console.log(`   Total de distribuições: ${fundo.distribuicoes.length}`)

      if (fundo.distribuicoes.length > 0) {
        console.log(`   📋 Distribuições:`)
        fundo.distribuicoes.forEach(d => {
          console.log(`      • ${d.valor.toFixed(2)} - ${d.tipo} - ${d.data.toLocaleString()}`)
        })
      }
    }

    // Verificar total de sementes em circulação
    const totalSementes = await prisma.usuario.aggregate({
      _sum: {
        sementes: true
      }
    })

    console.log(`\n🌱 Total de sementes em circulação: ${totalSementes._sum.sementes || 0}`)

    // Verificar histórico de sementes por tipo
    const historicoPorTipo = await prisma.semente.groupBy({
      by: ['tipo'],
      _sum: {
        quantidade: true
      }
    })

    console.log(`\n📋 Histórico de sementes por tipo:`)
    historicoPorTipo.forEach(item => {
      console.log(`   ${item.tipo}: ${item._sum.quantidade || 0}`)
    })

  } catch (error) {
    console.error('❌ Erro durante verificação:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarFundos() 