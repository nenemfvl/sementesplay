const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugDistribuicao() {
  try {
    console.log('🔍 DEBUG DA DISTRIBUIÇÃO DO FUNDO\n')

    // 1. Verificar fundo
    const fundo = await prisma.fundoSementes.findFirst({
      where: { distribuido: true },
      orderBy: { dataInicio: 'desc' }
    })

    if (!fundo) {
      console.log('❌ Nenhum fundo distribuído encontrado')
      return
    }

    console.log('1️⃣ FUNDO ANALISADO:')
    console.log(`   • ID: ${fundo.id}`)
    console.log(`   • Valor total: R$ ${fundo.valorTotal.toFixed(2)}`)
    console.log(`   • Data início: ${fundo.dataInicio.toLocaleString()}`)
    console.log(`   • Data fim: ${fundo.dataFim.toLocaleString()}`)
    console.log(`   • Distribuído: ${fundo.distribuido}`)

    // 2. Verificar criadores
    console.log('\n2️⃣ CRIADORES ATIVOS:')
    const criadores = await prisma.criador.findMany({
      include: {
        _count: {
          select: { conteudos: true }
        },
        usuario: {
          select: {
            id: true,
            nome: true
          }
        }
      },
      where: {
        conteudos: {
          some: { removido: false }
        }
      }
    })

    console.log(`📊 Criadores ativos: ${criadores.length}`)
    criadores.forEach(criador => {
      console.log(`   • ${criador.usuario.nome}: ${criador._count.conteudos} conteúdos`)
    })

    // 3. Verificar compras no período
    console.log('\n3️⃣ COMPRAS NO PERÍODO DO FUNDO:')
    const compras = await prisma.compraParceiro.findMany({
      where: {
        dataCompra: {
          gte: fundo.dataInicio,
          lte: fundo.dataFim
        },
        status: 'cashback_liberado'
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    })

    console.log(`📊 Compras no período: ${compras.length}`)
    compras.forEach(compra => {
      console.log(`   • ${compra.usuario.nome}: R$ ${compra.valorCompra.toFixed(2)} - ${compra.dataCompra.toLocaleString()}`)
    })

    // 4. Verificar todas as compras
    console.log('\n4️⃣ TODAS AS COMPRAS:')
    const todasCompras = await prisma.compraParceiro.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true
          }
        }
      },
      orderBy: {
        dataCompra: 'desc'
      }
    })

    console.log(`📊 Total de compras: ${todasCompras.length}`)
    todasCompras.forEach(compra => {
      console.log(`   • ${compra.usuario.nome}: R$ ${compra.valorCompra.toFixed(2)} - ${compra.status} - ${compra.dataCompra.toLocaleString()}`)
    })

    // 5. Verificar distribuições
    console.log('\n5️⃣ DISTRIBUIÇÕES REALIZADAS:')
    const distribuicoes = await prisma.distribuicaoFundo.findMany({
      where: {
        fundoId: fundo.id
      },
      include: {
        usuario: {
          select: {
            nome: true
          }
        },
        criador: {
          include: {
            usuario: {
              select: {
                nome: true
              }
            }
          }
        }
      }
    })

    console.log(`📊 Total de distribuições: ${distribuicoes.length}`)
    let totalDistribuido = 0
    distribuicoes.forEach(dist => {
      totalDistribuido += dist.valor
      if (dist.tipo === 'criador') {
        console.log(`   • Criador: ${dist.criador.usuario.nome} - R$ ${dist.valor.toFixed(2)}`)
      } else {
        console.log(`   • Usuário: ${dist.usuario.nome} - R$ ${dist.valor.toFixed(2)}`)
      }
    })

    console.log(`📊 Total distribuído: R$ ${totalDistribuido.toFixed(2)}`)
    console.log(`📊 Valor do fundo: R$ ${fundo.valorTotal.toFixed(2)}`)
    console.log(`📊 Diferença: R$ ${(fundo.valorTotal - totalDistribuido).toFixed(2)}`)

    // 6. Análise do problema
    console.log('\n6️⃣ ANÁLISE DO PROBLEMA:')
    
    const valorCriadores = fundo.valorTotal * 0.5
    const valorUsuarios = fundo.valorTotal * 0.5
    
    console.log(`💰 Distribuição esperada:`)
    console.log(`   • Criadores (50%): R$ ${valorCriadores.toFixed(2)}`)
    console.log(`   • Usuários (50%): R$ ${valorUsuarios.toFixed(2)}`)

    if (compras.length === 0) {
      console.log('❌ PROBLEMA IDENTIFICADO: Nenhuma compra no período do fundo!')
      console.log('💡 A distribuição para usuários só acontece se houver compras com status "cashback_liberado" no período.')
    } else {
      console.log('✅ Compras encontradas no período')
    }

    // 7. Sugestões
    console.log('\n7️⃣ SUGESTÕES:')
    if (compras.length === 0) {
      console.log('🔧 Para corrigir:')
      console.log('   1. Verificar se as compras têm status "cashback_liberado"')
      console.log('   2. Verificar se as datas das compras estão dentro do período do fundo')
      console.log('   3. Ou ajustar as datas do fundo para incluir as compras existentes')
    }

    console.log('\n🎉 DEBUG CONCLUÍDO!')

  } catch (error) {
    console.error('❌ Erro durante o debug:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o debug
debugDistribuicao()
