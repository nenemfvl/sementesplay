const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarRepasses() {
  try {
    console.log('🔍 Verificando repasses pendentes...')
    
    // Buscar todos os repasses
    const repasses = await prisma.repasseParceiro.findMany({
      include: {
        parceiro: {
          select: {
            nomeCidade: true
          }
        },
        compra: {
          select: {
            id: true,
            valorCompra: true,
            usuario: {
              select: {
                nome: true
              }
            }
          }
        }
      },
      orderBy: {
        dataRepasse: 'desc'
      }
    })
    
    console.log(`📊 Total de repasses: ${repasses.length}`)
    
    // Agrupar por status
    const porStatus = repasses.reduce((acc, rep) => {
      acc[rep.status] = (acc[rep.status] || 0) + 1
      return acc
    }, {})
    
    console.log('📈 Status dos repasses:')
    Object.entries(porStatus).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count}`)
    })
    
    // Mostrar detalhes dos pendentes
    const pendentes = repasses.filter(r => r.status === 'pendente')
    console.log(`\n📋 Repasses pendentes (${pendentes.length}):`)
    
    pendentes.forEach(rep => {
      console.log(`  - ID: ${rep.id}`)
      console.log(`    Parceiro: ${rep.parceiro.nomeCidade}`)
      console.log(`    Usuário: ${rep.compra.usuario.nome}`)
      console.log(`    Valor: R$ ${rep.valor}`)
      console.log(`    Data: ${rep.dataRepasse.toLocaleDateString()}`)
      console.log(`    Comprovante: ${rep.comprovanteUrl ? 'Sim' : 'Não'}`)
      console.log('')
    })
    
    // Verificar compras aprovadas sem repasse
    const comprasAprovadas = await prisma.compraParceiro.findMany({
      where: {
        status: 'aprovada'
      },
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
        },
        repasse: {
          select: {
            id: true,
            status: true
          }
        }
      }
    })
    
    console.log(`📊 Compras aprovadas: ${comprasAprovadas.length}`)
    
    const comprasSemRepasse = comprasAprovadas.filter(c => !c.repasse)
    console.log(`⚠️  Compras aprovadas sem repasse: ${comprasSemRepasse.length}`)
    
    comprasSemRepasse.forEach(compra => {
      console.log(`  - ID: ${compra.id}`)
      console.log(`    Parceiro: ${compra.parceiro.nomeCidade}`)
      console.log(`    Usuário: ${compra.usuario.nome}`)
      console.log(`    Valor: R$ ${compra.valorCompra}`)
      console.log(`    Data: ${compra.dataCompra.toLocaleDateString()}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Erro ao verificar repasses:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarRepasses() 