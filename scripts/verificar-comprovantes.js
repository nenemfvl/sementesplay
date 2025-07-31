const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarComprovantes() {
  try {
    console.log('🔍 Verificando onde estão os comprovantes...')
    
    // Buscar todas as compras
    const compras = await prisma.compraParceiro.findMany({
      select: {
        id: true,
        comprovanteUrl: true,
        status: true,
        valorCompra: true,
        dataCompra: true,
        parceiro: {
          select: {
            nomeCidade: true
          }
        }
      }
    })
    
    console.log(`📊 Total de compras: ${compras.length}`)
    
    // Compras com comprovante
    const comprasComComprovante = compras.filter(c => c.comprovanteUrl)
    console.log(`📄 Compras com comprovante: ${comprasComComprovante.length}`)
    
    comprasComComprovante.forEach(compra => {
      console.log(`  - ID: ${compra.id}`)
      console.log(`    Parceiro: ${compra.parceiro.nomeCidade}`)
      console.log(`    Valor: R$ ${compra.valorCompra}`)
      console.log(`    Status: ${compra.status}`)
      console.log(`    Comprovante: ${compra.comprovanteUrl}`)
      console.log('')
    })
    
    // Buscar repasses
    const repasses = await prisma.repasseParceiro.findMany({
      select: {
        id: true,
        comprovanteUrl: true,
        status: true,
        valor: true,
        dataRepasse: true,
        compra: {
          select: {
            id: true,
            valorCompra: true,
            comprovanteUrl: true
          }
        }
      }
    })
    
    console.log(`📊 Total de repasses: ${repasses.length}`)
    
    // Repasses com comprovante
    const repassesComComprovante = repasses.filter(r => r.comprovanteUrl)
    console.log(`📄 Repasses com comprovante: ${repassesComComprovante.length}`)
    
    repassesComComprovante.forEach(repasse => {
      console.log(`  - ID: ${repasse.id}`)
      console.log(`    Valor: R$ ${repasse.valor}`)
      console.log(`    Status: ${repasse.status}`)
      console.log(`    Comprovante: ${repasse.comprovanteUrl}`)
      console.log('')
    })
    
    // Verificar se há compras com comprovante mas sem repasse correspondente
    console.log('🔍 Verificando compras com comprovante mas sem repasse...')
    
    for (const compra of comprasComComprovante) {
      const repasse = await prisma.repasseParceiro.findFirst({
        where: {
          compraId: compra.id
        }
      })
      
      if (!repasse) {
        console.log(`⚠️  Compra ${compra.id} tem comprovante mas não tem repasse!`)
        console.log(`   Comprovante: ${compra.comprovanteUrl}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar comprovantes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarComprovantes() 