const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarCiclo() {
  try {
    const config = await prisma.configuracaoCiclos.findFirst()
    console.log('📊 Estado atual do sistema de ciclos:')
    console.log('   🔄 Ciclo atual:', config?.numeroCiclo)
    console.log('   🏆 Season atual:', config?.numeroSeason)
    console.log('   📅 Data início ciclo:', config?.dataInicioCiclo)
    console.log('   📅 Data início season:', config?.dataInicioSeason)
    
    // Calcular quantos dias restam
    const agora = new Date()
    const dataFimCiclo = new Date(config.dataInicioCiclo)
    dataFimCiclo.setDate(dataFimCiclo.getDate() + 15)
    
    const dataFimSeason = new Date(config.dataInicioSeason)
    dataFimSeason.setMonth(dataFimSeason.getMonth() + 3)
    
    const diasRestantesCiclo = Math.max(0, Math.ceil((dataFimCiclo.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)))
    const diasRestantesSeason = Math.max(0, Math.ceil((dataFimSeason.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)))
    
    console.log('   ⏳ Dias restantes ciclo:', diasRestantesCiclo)
    console.log('   ⏳ Dias restantes season:', diasRestantesSeason)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarCiclo()
