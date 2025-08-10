const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarFundos() {
  console.log('🔍 Verificando fundos de sementes...')

  try {
    // Buscar fundo pendente
    const fundoPendente = await prisma.fundoSementes.findFirst({
      where: { distribuido: false }
    })

    if (fundoPendente) {
      console.log(`\n📊 Fundo pendente encontrado:`)
      console.log(`   ID: ${fundoPendente.id}`)
      console.log(`   Valor: R$ ${fundoPendente.valorTotal.toFixed(2)}`)
      console.log(`   Data início: ${fundoPendente.dataInicio.toLocaleString()}`)
      console.log(`   Data fim: ${fundoPendente.dataFim.toLocaleString()}`)
      console.log(`   Distribuído: ${fundoPendente.distribuido ? 'Sim' : 'Não'}`)
    } else {
      console.log('\n✅ Nenhum fundo pendente de distribuição')
    }

    // Buscar todos os fundos
    const todosFundos = await prisma.fundoSementes.findMany({
      orderBy: { dataInicio: 'desc' }
    })

    console.log(`\n📊 Total de fundos: ${todosFundos.length}`)
    
    for (const fundo of todosFundos) {
      console.log(`\n🔍 Fundo: R$ ${fundo.valorTotal.toFixed(2)} - ${fundo.distribuido ? '✅ Distribuído' : '⏳ Pendente'}`)
    }

    // Verificar distribuições
    const distribuicoes = await prisma.distribuicaoFundo.findMany({
      include: {
        fundo: true
      },
      orderBy: { data: 'desc' },
      take: 10
    })

    console.log(`\n📋 Últimas distribuições:`)
    distribuicoes.forEach(d => {
      console.log(`   • ${d.valor.toFixed(2)} sementes - ${d.tipo} - ${d.data.toLocaleString()}`)
    })

  } catch (error) {
    console.error('❌ Erro durante verificação:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarFundos()
