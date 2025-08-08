const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function despausarCiclos() {
  try {
    console.log('▶️  Despausando sistema de ciclos...')
    
    // Despausar o sistema
    await prisma.configuracaoCiclos.updateMany({
      data: {
        pausado: false
      }
    })
    
    console.log('✅ Sistema de ciclos despausado com sucesso!')
    console.log('🚀 Os ciclos voltarão a avançar automaticamente conforme o cronograma')
    console.log('⏱️  Próximo reset: quando atingir 15 dias do ciclo atual')
    
    // Verificar status
    const config = await prisma.configuracaoCiclos.findFirst()
    console.log('\n📊 Status atual:')
    console.log('   🔄 Ciclo atual:', config?.numeroCiclo)
    console.log('   🏆 Season atual:', config?.numeroSeason)
    console.log('   ⏸️  Pausado:', config?.pausado ? 'SIM' : 'NÃO')
    
    // Calcular dias restantes
    const agora = new Date()
    const dataFimCiclo = new Date(config.dataInicioCiclo)
    dataFimCiclo.setDate(dataFimCiclo.getDate() + 15)
    
    const diasRestantesCiclo = Math.max(0, Math.ceil((dataFimCiclo.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)))
    console.log('   ⏳ Dias restantes ciclo:', diasRestantesCiclo)
    
  } catch (error) {
    console.error('❌ Erro ao despausar ciclos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

despausarCiclos()
