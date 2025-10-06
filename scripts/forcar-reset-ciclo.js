const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function forcarResetCiclo() {
  try {
    console.log('🔄 Forçando reset do ciclo para ativar o Ciclo 2...\n')

    // 1. Verificar configuração atual
    console.log('1️⃣ Verificando configuração atual...')
    const config = await prisma.configuracaoCiclos.findFirst()
    
    if (!config) {
      console.log('   ❌ Nenhuma configuração encontrada')
      return
    }

    console.log(`   ✅ Ciclo atual: #${config.numeroCiclo}`)
    console.log(`   ✅ Season atual: S${config.numeroSeason}`)
    console.log(`   ⏸️  Pausado: ${config.pausado ? 'SIM' : 'NÃO'}`)
    console.log(`   📅 Início do ciclo: ${config.dataInicioCiclo}`)

    // 2. Calcular se o ciclo expirou
    const agora = new Date()
    const dataFimCiclo = new Date(config.dataInicioCiclo)
    dataFimCiclo.setDate(dataFimCiclo.getDate() + 15)
    
    const diasRestantesCiclo = Math.max(0, Math.ceil((dataFimCiclo.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)))
    
    console.log(`   ⏳ Dias restantes ciclo: ${diasRestantesCiclo}`)
    console.log(`   📅 Fim do ciclo: ${dataFimCiclo.toLocaleString('pt-BR')}`)

    // 3. Forçar reset se necessário
    if (diasRestantesCiclo === 0 || agora >= dataFimCiclo) {
      console.log('\n2️⃣ Ciclo expirado! Forçando reset...')
      
      // Reset do ciclo
      await prisma.configuracaoCiclos.update({
        where: { id: config.id },
        data: {
          dataInicioCiclo: agora,
          numeroCiclo: config.numeroCiclo + 1,
          pausado: false
        }
      })
      
      // Resetar ranking do ciclo
      await prisma.rankingCiclo.deleteMany()
      
      // Resetar níveis de criadores para 'criador-iniciante'
      await prisma.usuario.updateMany({
        where: {
          nivel: {
            in: ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo']
          }
        },
        data: {
          nivel: 'criador-iniciante'
        }
      })
      
      // ZERAR PONTUAÇÕES DE TODOS OS USUÁRIOS (novo)
      console.log('   🔄 Zerando pontuações de todos os usuários...')
      await prisma.usuario.updateMany({
        data: {
          pontuacao: 0
        }
      })
      
      // ZERAR DOAÇÕES RECEBIDAS (novo)
      console.log('   🔄 Zerando doações recebidas...')
      await prisma.doacao.deleteMany()
      
      // ZERAR HISTÓRICO DE SEMENTES (novo)
      console.log('   🔄 Zerando histórico de sementes...')
      await prisma.semente.deleteMany()
      
      // Limpar conteúdos para dar oportunidade igual a todos
      await prisma.conteudo.deleteMany()
      await prisma.conteudoParceiro.deleteMany()
      
      // NOVO: Resetar vendas dos parceiros
      console.log('   🔄 Zerando vendas dos parceiros...')
      await prisma.compraParceiro.deleteMany()
      await prisma.repasseParceiro.deleteMany()
      await prisma.solicitacaoCompra.deleteMany()
      await prisma.codigoCashback.deleteMany()
      
      // Resetar campos de vendas na tabela Parceiro
      await prisma.parceiro.updateMany({
        data: {
          totalVendas: 0,
          codigosGerados: 0,
          saldoDevedor: 0
        }
      })
      
      console.log('   ✅ Reset do ciclo concluído!')
      console.log(`   🔄 Novo ciclo: #${config.numeroCiclo + 1}`)
      console.log(`   📅 Início: ${agora.toLocaleString('pt-BR')}`)
      console.log(`   ⏳ Próximo reset: ${new Date(agora.getTime() + (15 * 24 * 60 * 60 * 1000)).toLocaleString('pt-BR')}`)
      
    } else {
      console.log('\n2️⃣ Ciclo ainda não expirou!')
      console.log(`   ⏳ Ainda restam ${diasRestantesCiclo} dias para o Ciclo #${config.numeroCiclo}`)
      console.log('   💡 Para forçar reset antecipado, modifique a data de início do ciclo')
    }

    // 4. Verificar resultado final
    console.log('\n3️⃣ Verificando resultado...')
    const configAtualizada = await prisma.configuracaoCiclos.findFirst()
    
    const novaDataFimCiclo = new Date(configAtualizada.dataInicioCiclo)
    novaDataFimCiclo.setDate(novaDataFimCiclo.getDate() + 15)
    
    const novosDiasRestantes = Math.max(0, Math.ceil((novaDataFimCiclo.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)))
    
    console.log(`   ✅ Ciclo atual: #${configAtualizada.numeroCiclo}`)
    console.log(`   ✅ Season atual: S${configAtualizada.numeroSeason}`)
    console.log(`   ⏸️  Pausado: ${configAtualizada.pausado ? 'SIM' : 'NÃO'}`)
    console.log(`   ⏳ Dias restantes: ${novosDiasRestantes}`)
    console.log(`   📅 Fim do ciclo: ${novaDataFimCiclo.toLocaleString('pt-BR')}`)

    console.log('\n🎉 Sistema de ciclos ativado com sucesso!')
    console.log('🚀 O Ciclo 2 está agora ativo e funcionando!')
    console.log('⚖️  Sistema agora é mais justo para novos usuários!')

  } catch (error) {
    console.error('❌ Erro ao forçar reset do ciclo:', error)
  } finally {
    await prisma.$disconnect()
  }
}

forcarResetCiclo()
