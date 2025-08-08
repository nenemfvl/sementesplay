const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function resetarParaCiclo1() {
  try {
    console.log('🔄 Resetando sistema para Ciclo #1...')
    
    const agora = new Date()
    
    // Resetar para ciclo 1
    await prisma.configuracaoCiclos.updateMany({
      data: {
        dataInicioCiclo: agora,
        dataInicioSeason: agora,
        numeroSeason: 1,
        numeroCiclo: 1
      }
    })
    
    // Limpar rankings
    await prisma.rankingCiclo.deleteMany()
    await prisma.rankingSeason.deleteMany()
    
    console.log('✅ Sistema resetado para Ciclo #1, Season S1')
    
    // Verificar resultado
    const config = await prisma.configuracaoCiclos.findFirst()
    console.log('📊 Estado após reset:')
    console.log('   🔄 Ciclo atual:', config?.numeroCiclo)
    console.log('   🏆 Season atual:', config?.numeroSeason)
    
  } catch (error) {
    console.error('❌ Erro ao resetar:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetarParaCiclo1()
