const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarSolicitacoes() {
  try {
    console.log('🔍 Verificando solicitações de compra...')
    
    // Buscar todas as solicitações
    const solicitacoes = await prisma.solicitacaoCompra.findMany({
      include: {
        usuario: {
          select: {
            nome: true,
            email: true
          }
        },
        parceiro: {
          select: {
            nomeCidade: true
          }
        }
      },
      orderBy: {
        dataCompra: 'desc'
      }
    })
    
    console.log(`📊 Total de solicitações: ${solicitacoes.length}`)
    
    // Agrupar por status
    const porStatus = solicitacoes.reduce((acc, sol) => {
      acc[sol.status] = (acc[sol.status] || 0) + 1
      return acc
    }, {})
    
    console.log('📈 Status das solicitações:')
    Object.entries(porStatus).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count}`)
    })
    
    // Mostrar detalhes das pendentes
    const pendentes = solicitacoes.filter(s => s.status === 'pendente')
    console.log(`\n📋 Solicitações pendentes (${pendentes.length}):`)
    
    pendentes.forEach(sol => {
      console.log(`  - ID: ${sol.id}`)
      console.log(`    Usuário: ${sol.usuario.nome} (${sol.usuario.email})`)
      console.log(`    Parceiro: ${sol.parceiro.nomeCidade}`)
      console.log(`    Valor: R$ ${sol.valorCompra}`)
      console.log(`    Data: ${sol.dataCompra.toLocaleDateString()}`)
      console.log(`    Comprovante: ${sol.comprovanteUrl ? 'Sim' : 'Não'}`)
      console.log('')
    })
    
    // Verificar se há compras diretas (antigas)
    const comprasDiretas = await prisma.compraParceiro.findMany({
      where: {
        status: 'pendente'
      },
      include: {
        usuario: {
          select: {
            nome: true,
            email: true
          }
        },
        parceiro: {
          select: {
            nomeCidade: true
          }
        }
      }
    })
    
    console.log(`📊 Compras diretas pendentes: ${comprasDiretas.length}`)
    
    comprasDiretas.forEach(compra => {
      console.log(`  - ID: ${compra.id}`)
      console.log(`    Usuário: ${compra.usuario.nome}`)
      console.log(`    Parceiro: ${compra.parceiro.nomeCidade}`)
      console.log(`    Valor: R$ ${compra.valorCompra}`)
      console.log(`    Data: ${compra.dataCompra.toLocaleDateString()}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Erro ao verificar solicitações:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarSolicitacoes() 