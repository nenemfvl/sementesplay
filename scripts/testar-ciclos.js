const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testarCiclos() {
  try {
    console.log('🧪 Testando sistema de ciclos...\n')

    // 1. Verificar configuração atual
    console.log('1️⃣ Verificando configuração atual...')
    let config = await prisma.configuracaoCiclos.findFirst()
    
    if (!config) {
      console.log('   ❌ Nenhuma configuração encontrada')
      return
    }

    console.log(`   ✅ Ciclo atual: #${config.numeroCiclo}`)
    console.log(`   ✅ Season atual: S${config.numeroSeason}`)
    console.log(`   📅 Início do ciclo: ${config.dataInicioCiclo}`)
    console.log(`   📅 Início da season: ${config.dataInicioSeason}`)

    // 2. Calcular dias restantes
    console.log('\n2️⃣ Calculando dias restantes...')
    const agora = new Date()
    
    const dataFimCiclo = new Date(config.dataInicioCiclo)
    dataFimCiclo.setDate(dataFimCiclo.getDate() + 15)
    
    const dataFimSeason = new Date(config.dataInicioSeason)
    dataFimSeason.setMonth(dataFimSeason.getMonth() + 3)
    
    const diasRestantesCiclo = Math.max(0, Math.ceil((dataFimCiclo.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)))
    const diasRestantesSeason = Math.max(0, Math.ceil((dataFimSeason.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)))
    
    console.log(`   📊 Dias restantes para o ciclo: ${diasRestantesCiclo}`)
    console.log(`   📊 Dias restantes para a season: ${diasRestantesSeason}`)

    // 3. Testar API
    console.log('\n3️⃣ Testando API...')
    const response = await fetch('http://localhost:3000/api/ranking/ciclos')
    const data = await response.json()
    
    console.log(`   ✅ API retornou: ${JSON.stringify(data, null, 2)}`)

    // 4. Simular reset do ciclo (para teste)
    console.log('\n4️⃣ Simulando reset do ciclo (para teste)...')
    
    // Modificar a data de início para simular um ciclo antigo
    const dataAntiga = new Date()
    dataAntiga.setDate(dataAntiga.getDate() - 16) // 16 dias atrás
    
    await prisma.configuracaoCiclos.update({
      where: { id: config.id },
      data: {
        dataInicioCiclo: dataAntiga
      }
    })
    
    console.log('   🔄 Data do ciclo modificada para simular reset')

    // 5. Testar API novamente (deve fazer reset automático)
    console.log('\n5️⃣ Testando API após simulação...')
    const response2 = await fetch('http://localhost:3000/api/ranking/ciclos')
    const data2 = await response2.json()
    
    console.log(`   ✅ API após simulação: ${JSON.stringify(data2, null, 2)}`)

    // 6. Restaurar configuração original
    console.log('\n6️⃣ Restaurando configuração original...')
    await prisma.configuracaoCiclos.update({
      where: { id: config.id },
      data: {
        dataInicioCiclo: config.dataInicioCiclo
      }
    })
    
    console.log('   ✅ Configuração restaurada')

    console.log('\n🎉 Teste concluído com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar teste
testarCiclos() 