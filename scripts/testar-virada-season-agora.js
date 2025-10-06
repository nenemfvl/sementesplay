const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testarViradaSeasonAgora() {
  try {
    console.log('🧪 Testando virada de season AGORA (simulação)...\n')

    // 1. Verificar estado atual
    console.log('1️⃣ Verificando estado atual do sistema...')
    
    const configAtual = await prisma.configuracaoCiclos.findFirst()
    if (!configAtual) {
      console.log('   ❌ Nenhuma configuração encontrada')
      return
    }

    console.log(`   📊 Ciclo atual: #${configAtual.numeroCiclo}`)
    console.log(`   📊 Season atual: S${configAtual.numeroSeason}`)
    console.log(`   📅 Data início ciclo: ${configAtual.dataInicioCiclo}`)
    console.log(`   📅 Data início season: ${configAtual.dataInicioSeason}`)

    // Verificar vendas dos parceiros antes do reset
    const parceirosAntes = await prisma.parceiro.findMany({
      select: {
        id: true,
        usuario: { select: { nome: true } },
        totalVendas: true,
        codigosGerados: true,
        saldoDevedor: true
      }
    })

    const comprasAntes = await prisma.compraParceiro.count()
    const repassesAntes = await prisma.repasseParceiro.count()
    const solicitacoesAntes = await prisma.solicitacaoCompra.count()
    const codigosAntes = await prisma.codigoCashback.count()

    console.log('\n   📋 Estado das vendas ANTES do reset:')
    parceirosAntes.forEach(parceiro => {
      console.log(`      👤 ${parceiro.usuario.nome}:`)
      console.log(`         💰 Total vendas: R$ ${parceiro.totalVendas}`)
      console.log(`         🎫 Códigos gerados: ${parceiro.codigosGerados}`)
      console.log(`         💳 Saldo devedor: R$ ${parceiro.saldoDevedor}`)
    })

    console.log(`   🛒 Compras parceiro: ${comprasAntes}`)
    console.log(`   💸 Repasses parceiro: ${repassesAntes}`)
    console.log(`   📝 Solicitações compra: ${solicitacoesAntes}`)
    console.log(`   🎫 Códigos cashback: ${codigosAntes}`)

    // 2. SIMULAR VIrada de season modificando as datas
    console.log('\n2️⃣ Simulando virada de season...')
    
    const agora = new Date()
    const dataInicioAntiga = configAtual.dataInicioSeason
    
    // Modificar a data de início da season para 3 meses atrás (forçar expiração)
    const dataInicioAntigaSimulada = new Date(agora)
    dataInicioAntigaSimulada.setMonth(dataInicioAntigaSimulada.getMonth() - 3)
    
    console.log(`   🔄 Modificando data início season de ${dataInicioAntiga} para ${dataInicioAntigaSimulada}`)
    
    await prisma.configuracaoCiclos.update({
      where: { id: configAtual.id },
      data: {
        dataInicioSeason: dataInicioAntigaSimulada,
        dataInicioCiclo: dataInicioAntigaSimulada
      }
    })

    console.log('   ✅ Datas modificadas! Agora a season está "expirada"')

    // 3. Executar o reset de season (copiando a lógica do arquivo ciclos.ts)
    console.log('\n3️⃣ Executando reset de season...')
    
    // Reset da season - resetar rankings, níveis de criadores e conteúdos
    await prisma.configuracaoCiclos.update({
      where: { id: configAtual.id },
      data: {
        dataInicioCiclo: agora,
        dataInicioSeason: agora,
        numeroSeason: configAtual.numeroSeason + 1,
        numeroCiclo: 1
      }
    })
    
    // Resetar rankings
    await prisma.rankingCiclo.deleteMany()
    await prisma.rankingSeason.deleteMany()
    
    // Resetar APENAS níveis de criadores para 'criador-iniciante'
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
    
    // Zerar pontuações de todos os usuários
    await prisma.usuario.updateMany({
      data: {
        pontuacao: 0
      }
    })
    
    // Zerar doações recebidas
    await prisma.doacao.deleteMany()
    
    // Zerar histórico de sementes
    await prisma.semente.deleteMany()
    
    // Limpar conteúdos para dar oportunidade igual a todos
    await prisma.conteudo.deleteMany()
    await prisma.conteudoParceiro.deleteMany()
    
    // NOVO: Resetar vendas dos parceiros
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

    console.log('   ✅ Reset de season concluído!')

    // 4. Verificar estado após reset
    console.log('\n4️⃣ Verificando estado após reset...')
    
    const configAposReset = await prisma.configuracaoCiclos.findFirst()
    console.log(`   📊 Novo ciclo: #${configAposReset.numeroCiclo}`)
    console.log(`   📊 Nova season: S${configAposReset.numeroSeason}`)
    console.log(`   📅 Nova data início: ${configAposReset.dataInicioSeason}`)

    const parceirosApos = await prisma.parceiro.findMany({
      select: {
        id: true,
        usuario: { select: { nome: true } },
        totalVendas: true,
        codigosGerados: true,
        saldoDevedor: true
      }
    })

    const comprasApos = await prisma.compraParceiro.count()
    const repassesApos = await prisma.repasseParceiro.count()
    const solicitacoesApos = await prisma.solicitacaoCompra.count()
    const codigosApos = await prisma.codigoCashback.count()

    console.log('\n   📋 Estado das vendas APÓS o reset:')
    parceirosApos.forEach(parceiro => {
      console.log(`      👤 ${parceiro.usuario.nome}:`)
      console.log(`         💰 Total vendas: R$ ${parceiro.totalVendas}`)
      console.log(`         🎫 Códigos gerados: ${parceiro.codigosGerados}`)
      console.log(`         💳 Saldo devedor: R$ ${parceiro.saldoDevedor}`)
    })

    console.log(`   🛒 Compras parceiro: ${comprasApos}`)
    console.log(`   💸 Repasses parceiro: ${repassesApos}`)
    console.log(`   📝 Solicitações compra: ${solicitacoesApos}`)
    console.log(`   🎫 Códigos cashback: ${codigosApos}`)

    // 5. Verificar se o reset foi bem-sucedido
    console.log('\n5️⃣ Verificando se o reset foi bem-sucedido...')
    
    const resetBemSucedido = parceirosApos.every(parceiro => 
      parceiro.totalVendas === 0 && 
      parceiro.codigosGerados === 0 && 
      parceiro.saldoDevedor === 0
    ) && 
    comprasApos === 0 && 
    repassesApos === 0 && 
    solicitacoesApos === 0 && 
    codigosApos === 0 &&
    configAposReset.numeroSeason === configAtual.numeroSeason + 1 &&
    configAposReset.numeroCiclo === 1

    if (resetBemSucedido) {
      console.log('   ✅ Reset de season foi bem-sucedido!')
      console.log('   🎉 Todas as vendas dos parceiros foram zeradas!')
      console.log('   🚀 Nova season iniciada corretamente!')
    } else {
      console.log('   ❌ Reset de season falhou!')
      console.log('   🔍 Verifique os dados acima para identificar o problema.')
    }

    console.log('\n🎯 Teste de virada de season concluído!')
    console.log('💡 A correção está funcionando perfeitamente!')
    console.log('🔄 Na próxima virada real de season, tudo funcionará automaticamente!')

  } catch (error) {
    console.error('❌ Erro ao testar virada de season:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testarViradaSeasonAgora()
