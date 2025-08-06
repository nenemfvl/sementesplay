const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function criarFundoManual() {
  console.log('🔧 Criando fundo de sementes manualmente...')

  try {
    // Verificar se já existe um fundo
    const fundoExistente = await prisma.fundoSementes.findFirst({
      where: { distribuido: false }
    })

    if (fundoExistente) {
      console.log('❌ Já existe um fundo não distribuído')
      console.log(`   ID: ${fundoExistente.id}`)
      console.log(`   Valor: R$ ${fundoExistente.valorTotal.toFixed(2)}`)
      return
    }

    // Calcular valor que deveria estar no fundo
    // Baseado no repasse de R$ 1,00 com 25% para o fundo
    const valorFundo = 1.00 * 0.25 // R$ 0,25

    console.log(`💰 Criando fundo com valor: R$ ${valorFundo.toFixed(2)}`)

    // Criar o fundo
    const novoFundo = await prisma.fundoSementes.create({
      data: {
        ciclo: 1,
        valorTotal: valorFundo,
        dataInicio: new Date(),
        dataFim: new Date(),
        distribuido: false
      }
    })

    console.log(`✅ Fundo criado com sucesso!`)
    console.log(`   ID: ${novoFundo.id}`)
    console.log(`   Valor: R$ ${novoFundo.valorTotal.toFixed(2)}`)
    console.log(`   Ciclo: ${novoFundo.ciclo}`)

    // Verificar se agora aparece no painel admin
    const totalSementes = await prisma.fundoSementes.findFirst({
      where: { distribuido: false },
      orderBy: { ciclo: 'desc' }
    })

    console.log(`\n🌱 Agora o painel admin mostrará: R$ ${totalSementes?.valorTotal.toFixed(2) || '0.00'} em sementes em circulação`)

  } catch (error) {
    console.error('❌ Erro ao criar fundo:', error)
  } finally {
    await prisma.$disconnect()
  }
}

criarFundoManual() 