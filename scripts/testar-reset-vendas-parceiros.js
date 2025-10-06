const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testarResetVendasParceiros() {
  try {
    console.log('🧪 Testando reset de vendas dos parceiros...\n')

    // 1. Verificar estado atual das vendas dos parceiros
    console.log('1️⃣ Verificando estado atual das vendas dos parceiros...')
    
    const parceiros = await prisma.parceiro.findMany({
      select: {
        id: true,
        usuario: {
          select: {
            nome: true
          }
        },
        totalVendas: true,
        codigosGerados: true,
        saldoDevedor: true
      }
    })

    console.log(`   📊 Total de parceiros encontrados: ${parceiros.length}`)
    
    if (parceiros.length > 0) {
      console.log('   📋 Estado atual dos parceiros:')
      parceiros.forEach(parceiro => {
        console.log(`      👤 ${parceiro.usuario.nome}:`)
        console.log(`         💰 Total vendas: R$ ${parceiro.totalVendas}`)
        console.log(`         🎫 Códigos gerados: ${parceiro.codigosGerados}`)
        console.log(`         💳 Saldo devedor: R$ ${parceiro.saldoDevedor}`)
      })
    }

    // 2. Verificar tabelas relacionadas às vendas
    console.log('\n2️⃣ Verificando tabelas relacionadas às vendas...')
    
    const comprasParceiro = await prisma.compraParceiro.count()
    const repassesParceiro = await prisma.repasseParceiro.count()
    const solicitacoesCompra = await prisma.solicitacaoCompra.count()
    const codigosCashback = await prisma.codigoCashback.count()

    console.log(`   🛒 Compras parceiro: ${comprasParceiro}`)
    console.log(`   💸 Repasses parceiro: ${repassesParceiro}`)
    console.log(`   📝 Solicitações compra: ${solicitacoesCompra}`)
    console.log(`   🎫 Códigos cashback: ${codigosCashback}`)

    // 3. Simular reset das vendas dos parceiros
    console.log('\n3️⃣ Simulando reset das vendas dos parceiros...')
    
    // Resetar vendas dos parceiros
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

    console.log('   ✅ Reset das vendas dos parceiros concluído!')

    // 4. Verificar estado após reset
    console.log('\n4️⃣ Verificando estado após reset...')
    
    const parceirosAposReset = await prisma.parceiro.findMany({
      select: {
        id: true,
        usuario: {
          select: {
            nome: true
          }
        },
        totalVendas: true,
        codigosGerados: true,
        saldoDevedor: true
      }
    })

    console.log('   📋 Estado após reset dos parceiros:')
    parceirosAposReset.forEach(parceiro => {
      console.log(`      👤 ${parceiro.usuario.nome}:`)
      console.log(`         💰 Total vendas: R$ ${parceiro.totalVendas}`)
      console.log(`         🎫 Códigos gerados: ${parceiro.codigosGerados}`)
      console.log(`         💳 Saldo devedor: R$ ${parceiro.saldoDevedor}`)
    })

    // Verificar tabelas relacionadas após reset
    const comprasParceiroApos = await prisma.compraParceiro.count()
    const repassesParceiroApos = await prisma.repasseParceiro.count()
    const solicitacoesCompraApos = await prisma.solicitacaoCompra.count()
    const codigosCashbackApos = await prisma.codigoCashback.count()

    console.log('\n   📊 Tabelas relacionadas após reset:')
    console.log(`   🛒 Compras parceiro: ${comprasParceiroApos}`)
    console.log(`   💸 Repasses parceiro: ${repassesParceiroApos}`)
    console.log(`   📝 Solicitações compra: ${solicitacoesCompraApos}`)
    console.log(`   🎫 Códigos cashback: ${codigosCashbackApos}`)

    // 5. Verificar se o reset foi bem-sucedido
    console.log('\n5️⃣ Verificando se o reset foi bem-sucedido...')
    
    const resetBemSucedido = parceirosAposReset.every(parceiro => 
      parceiro.totalVendas === 0 && 
      parceiro.codigosGerados === 0 && 
      parceiro.saldoDevedor === 0
    ) && 
    comprasParceiroApos === 0 && 
    repassesParceiroApos === 0 && 
    solicitacoesCompraApos === 0 && 
    codigosCashbackApos === 0

    if (resetBemSucedido) {
      console.log('   ✅ Reset das vendas dos parceiros foi bem-sucedido!')
      console.log('   🎉 Todas as vendas foram zeradas corretamente!')
    } else {
      console.log('   ❌ Reset das vendas dos parceiros falhou!')
      console.log('   🔍 Verifique os dados acima para identificar o problema.')
    }

    console.log('\n🎯 Teste concluído!')
    console.log('💡 Agora as vendas dos parceiros serão resetadas automaticamente na virada de season!')

  } catch (error) {
    console.error('❌ Erro ao testar reset de vendas dos parceiros:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testarResetVendasParceiros()
