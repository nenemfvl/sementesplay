const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarComprasStatus() {
  try {
    console.log('🔍 Verificando status das compras...')
    
    // Buscar todas as compras
    const compras = await prisma.compraParceiro.findMany({
      include: {
        parceiro: {
          select: {
            nomeCidade: true
          }
        },
        usuario: {
          select: {
            nome: true
          }
        }
      },
      orderBy: {
        dataCompra: 'desc'
      }
    })
    
    console.log(`📊 Total de compras: ${compras.length}`)
    
    // Agrupar por status
    const porStatus = compras.reduce((acc, compra) => {
      acc[compra.status] = (acc[compra.status] || 0) + 1
      return acc
    }, {})
    
    console.log('📈 Status das compras:')
    Object.entries(porStatus).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count}`)
    })
    
    // Mostrar detalhes de cada compra
    console.log('\n📋 Detalhes das compras:')
    compras.forEach(compra => {
      console.log(`  - ID: ${compra.id}`)
      console.log(`    Parceiro: ${compra.parceiro.nomeCidade}`)
      console.log(`    Usuário: ${compra.usuario.nome}`)
      console.log(`    Valor: R$ ${compra.valorCompra}`)
      console.log(`    Status: ${compra.status}`)
      console.log(`    Data: ${compra.dataCompra.toLocaleDateString()}`)
      console.log(`    Comprovante: ${compra.comprovanteUrl ? 'Sim' : 'Não'}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Erro ao verificar compras:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarComprasStatus() 