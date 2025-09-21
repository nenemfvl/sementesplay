const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function resetarCiclosConfiguracao() {
  try {
    console.log('🔄 Resetando configuração de ciclos e seasons...')
    
    // Verificar configuração atual
    const configAtual = await prisma.configuracaoCiclos.findFirst()
    
    if (configAtual) {
      console.log('📋 Configuração atual:')
      console.log(`   Ciclo: ${configAtual.numeroCiclo}`)
      console.log(`   Season: ${configAtual.numeroSeason}`)
      console.log(`   Data início ciclo: ${configAtual.dataInicioCiclo}`)
      console.log(`   Data início season: ${configAtual.dataInicioSeason}`)
      console.log(`   Pausado: ${configAtual.pausado || false}`)
    }

    const agora = new Date()

    // Resetar para ciclo 1 e season 1
    if (configAtual) {
      await prisma.configuracaoCiclos.update({
        where: { id: configAtual.id },
        data: {
          dataInicioCiclo: agora,
          dataInicioSeason: agora,
          numeroSeason: 1,
          numeroCiclo: 1,
          pausado: false
        }
      })
      console.log('✅ Configuração existente atualizada')
    } else {
      await prisma.configuracaoCiclos.create({
        data: {
          dataInicioCiclo: agora,
          dataInicioSeason: agora,
          numeroSeason: 1,
          numeroCiclo: 1,
          pausado: false
        }
      })
      console.log('✅ Nova configuração criada')
    }

    // Verificar nova configuração
    const novaConfig = await prisma.configuracaoCiclos.findFirst()
    
    console.log('\n🎯 Nova configuração:')
    console.log(`   Ciclo: ${novaConfig.numeroCiclo}`)
    console.log(`   Season: ${novaConfig.numeroSeason}`)
    console.log(`   Data início ciclo: ${novaConfig.dataInicioCiclo}`)
    console.log(`   Data início season: ${novaConfig.dataInicioSeason}`)
    console.log(`   Pausado: ${novaConfig.pausado || false}`)

    // Calcular dias restantes
    const dataFimCiclo = new Date(novaConfig.dataInicioCiclo)
    dataFimCiclo.setDate(dataFimCiclo.getDate() + 15)
    
    const dataFimSeason = new Date(novaConfig.dataInicioSeason)
    dataFimSeason.setMonth(dataFimSeason.getMonth() + 3)
    
    const diasRestantesCiclo = Math.ceil((dataFimCiclo.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24))
    const diasRestantesSeason = Math.ceil((dataFimSeason.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24))

    console.log('\n📅 Próximos prazos:')
    console.log(`   Dias restantes ciclo: ${diasRestantesCiclo} dias`)
    console.log(`   Dias restantes season: ${diasRestantesSeason} dias`)
    console.log(`   Fim do ciclo: ${dataFimCiclo.toLocaleDateString()}`)
    console.log(`   Fim da season: ${dataFimSeason.toLocaleDateString()}`)

    console.log('\n🎉 Configuração de ciclos resetada com sucesso!')
    console.log('📱 A página de status agora mostrará Ciclo #1 e Season S1')

  } catch (error) {
    console.error('❌ Erro ao resetar configuração:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetarCiclosConfiguracao()
