const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function corrigirFundoDistribuicao() {
  console.log('🔧 Corrigindo fundo que falhou na distribuição...')

  try {
    // Buscar o fundo que falhou
    const fundo = await prisma.fundoSementes.findUnique({
      where: { id: 'cme3f0ise000elf044qhm0anp' }
    })

    if (!fundo) {
      console.log('❌ Fundo não encontrado')
      return
    }

    console.log(`\n📊 Fundo encontrado:`)
    console.log(`   ID: ${fundo.id}`)
    console.log(`   Valor: R$ ${fundo.valorTotal.toFixed(2)}`)
    console.log(`   Distribuído: ${fundo.distribuido}`)

    // Verificar se há distribuições
    const distribuicoes = await prisma.distribuicaoFundo.findMany({
      where: { fundoId: fundo.id }
    })

    console.log(`\n📋 Distribuições existentes: ${distribuicoes.length}`)

    if (distribuicoes.length === 0) {
      console.log('\n🔧 Corrigindo fundo...')
      
      // Marcar como não distribuído para permitir nova tentativa
      await prisma.fundoSementes.update({
        where: { id: fundo.id },
        data: { distribuido: false }
      })

      console.log('✅ Fundo marcado como não distribuído')
      console.log('🔄 Agora você pode tentar distribuir novamente pelo painel')
    } else {
      console.log('✅ Fundo já foi distribuído corretamente')
    }

  } catch (error) {
    console.error('❌ Erro durante correção:', error)
  } finally {
    await prisma.$disconnect()
  }
}

corrigirFundoDistribuicao()
