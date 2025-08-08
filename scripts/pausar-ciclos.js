const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function pausarCiclos() {
  try {
    console.log('⏸️  Pausando sistema de ciclos...')
    
    // Pausar o sistema
    await prisma.configuracaoCiclos.updateMany({
      data: {
        pausado: true
      }
    })
    
    console.log('✅ Sistema de ciclos pausado com sucesso!')
    console.log('📌 Os ciclos não avançarão automaticamente até serem despausados')
    console.log('🎯 Para despausar: node scripts/despausar-ciclos.js')
    
    // Verificar status
    const config = await prisma.configuracaoCiclos.findFirst()
    console.log('\n📊 Status atual:')
    console.log('   🔄 Ciclo atual:', config?.numeroCiclo)
    console.log('   🏆 Season atual:', config?.numeroSeason)
    console.log('   ⏸️  Pausado:', config?.pausado ? 'SIM' : 'NÃO')
    
  } catch (error) {
    console.error('❌ Erro ao pausar ciclos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

pausarCiclos()
