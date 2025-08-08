const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarDistribuicaoCompleta() {
  try {
    console.log('🔍 VERIFICAÇÃO COMPLETA DA DISTRIBUIÇÃO DO FUNDO\n')

    // 1. Verificar todos os fundos
    console.log('1️⃣ TODOS OS FUNDOS:')
    const todosFundos = await prisma.fundoSementes.findMany({
      include: {
        distribuicoes: true
      },
      orderBy: {
        dataInicio: 'desc'
      }
    })

    console.log(`📊 Total de fundos: ${todosFundos.length}`)
    let totalDistribuido = 0
    let totalNaoDistribuido = 0

    todosFundos.forEach((fundo, index) => {
      console.log(`\n   Fundo ${index + 1}:`)
      console.log(`   • ID: ${fundo.id}`)
      console.log(`   • Ciclo: ${fundo.ciclo}`)
      console.log(`   • Valor: R$ ${fundo.valorTotal.toFixed(2)}`)
      console.log(`   • Distribuído: ${fundo.distribuido ? '✅ Sim' : '❌ Não'}`)
      console.log(`   • Distribuições: ${fundo.distribuicoes.length}`)
      
      if (fundo.distribuido) {
        totalDistribuido += fundo.valorTotal
      } else {
        totalNaoDistribuido += fundo.valorTotal
      }

      if (fundo.distribuicoes.length > 0) {
        console.log(`   📋 Detalhes das distribuições:`)
        fundo.distribuicoes.forEach(d => {
          console.log(`      • ${d.valor.toFixed(2)} - ${d.tipo} - ${d.data.toLocaleString()}`)
        })
      }
    })

    console.log(`\n💰 RESUMO:`)
    console.log(`   • Total distribuído: R$ ${totalDistribuido.toFixed(2)}`)
    console.log(`   • Total não distribuído: R$ ${totalNaoDistribuido.toFixed(2)}`)

    // 2. Verificar distribuições por tipo
    console.log('\n2️⃣ DISTRIBUIÇÕES POR TIPO:')
    const distribuicoesPorTipo = await prisma.distribuicaoFundo.groupBy({
      by: ['tipo'],
      _sum: {
        valor: true
      },
      _count: {
        id: true
      }
    })

    distribuicoesPorTipo.forEach(item => {
      console.log(`   • ${item.tipo}: ${item._count.id} distribuições - R$ ${item._sum.valor.toFixed(2)}`)
    })

    // 3. Verificar usuários que receberam distribuições
    console.log('\n3️⃣ USUÁRIOS QUE RECEBERAM DISTRIBUIÇÕES:')
    const distribuicoesUsuarios = await prisma.distribuicaoFundo.findMany({
      where: {
        tipo: 'usuario',
        usuarioId: { not: null }
      },
      include: {
        usuario: {
          select: {
            nome: true,
            sementes: true
          }
        }
      },
      orderBy: {
        valor: 'desc'
      }
    })

    console.log(`📊 Usuários beneficiados: ${distribuicoesUsuarios.length}`)
    distribuicoesUsuarios.forEach(d => {
      console.log(`   • ${d.usuario.nome}: R$ ${d.valor.toFixed(2)} - ${d.usuario.sementes} sementes atuais`)
    })

    // 4. Verificar criadores que receberam distribuições
    console.log('\n4️⃣ CRIADORES QUE RECEBERAM DISTRIBUIÇÕES:')
    const distribuicoesCriadores = await prisma.distribuicaoFundo.findMany({
      where: {
        tipo: 'criador',
        criadorId: { not: null }
      },
      include: {
        criador: {
          include: {
            usuario: {
              select: {
                nome: true,
                sementes: true
              }
            }
          }
        }
      },
      orderBy: {
        valor: 'desc'
      }
    })

    console.log(`📊 Criadores beneficiados: ${distribuicoesCriadores.length}`)
    distribuicoesCriadores.forEach(d => {
      console.log(`   • ${d.criador.usuario.nome}: R$ ${d.valor.toFixed(2)} - ${d.criador.usuario.sementes} sementes atuais`)
    })

    // 5. Verificar consistência dos valores
    console.log('\n5️⃣ VERIFICAÇÃO DE CONSISTÊNCIA:')
    
    // Verificar se a soma das distribuições bate com o valor total dos fundos
    const totalDistribuicoes = await prisma.distribuicaoFundo.aggregate({
      _sum: {
        valor: true
      }
    })

    const totalDistribuicoesValor = totalDistribuicoes._sum.valor || 0
    console.log(`📊 Soma das distribuições: R$ ${totalDistribuicoesValor.toFixed(2)}`)
    console.log(`📊 Total dos fundos distribuídos: R$ ${totalDistribuido.toFixed(2)}`)
    
    const diferenca = Math.abs(totalDistribuicoesValor - totalDistribuido)
    console.log(`📊 Diferença: R$ ${diferenca.toFixed(2)}`)
    
    if (diferenca < 0.01) {
      console.log('✅ Consistência OK!')
    } else {
      console.log('❌ Inconsistência detectada!')
    }

    // 6. Verificar notificações de fundo
    console.log('\n6️⃣ NOTIFICAÇÕES DE FUNDO:')
    const notificacoesFundo = await prisma.notificacao.findMany({
      where: {
        tipo: 'fundo'
      },
      include: {
        usuario: {
          select: {
            nome: true
          }
        }
      },
      orderBy: {
        data: 'desc'
      }
    })

    console.log(`📧 Total de notificações de fundo: ${notificacoesFundo.length}`)
    notificacoesFundo.slice(0, 10).forEach(notif => {
      console.log(`   • ${notif.usuario.nome}: ${notif.titulo} - ${notif.data.toLocaleString()}`)
    })

    if (notificacoesFundo.length > 10) {
      console.log(`   ... e mais ${notificacoesFundo.length - 10} notificações`)
    }

    // 7. Verificar se há problemas
    console.log('\n7️⃣ ANÁLISE DE PROBLEMAS:')
    
    // Verificar fundos não distribuídos
    const fundosNaoDistribuidos = todosFundos.filter(f => !f.distribuido)
    if (fundosNaoDistribuidos.length > 0) {
      console.log(`⚠️  Fundos não distribuídos: ${fundosNaoDistribuidos.length}`)
      fundosNaoDistribuidos.forEach(f => {
        console.log(`   • ID: ${f.id} - R$ ${f.valorTotal.toFixed(2)}`)
      })
    } else {
      console.log('✅ Todos os fundos foram distribuídos')
    }

    // Verificar distribuições com valor zero
    const distribuicoesZero = await prisma.distribuicaoFundo.findMany({
      where: {
        valor: 0
      }
    })
    
    if (distribuicoesZero.length > 0) {
      console.log(`⚠️  Distribuições com valor zero: ${distribuicoesZero.length}`)
    } else {
      console.log('✅ Nenhuma distribuição com valor zero')
    }

    // Verificar distribuições duplicadas
    const distribuicoesDuplicadas = await prisma.distribuicaoFundo.groupBy({
      by: ['fundoId', 'usuarioId', 'criadorId'],
      having: {
        id: {
          _count: {
            gt: 1
          }
        }
      }
    })

    if (distribuicoesDuplicadas.length > 0) {
      console.log(`⚠️  Possíveis distribuições duplicadas: ${distribuicoesDuplicadas.length}`)
    } else {
      console.log('✅ Nenhuma distribuição duplicada detectada')
    }

    console.log('\n🎉 VERIFICAÇÃO COMPLETA CONCLUÍDA!')

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar a verificação
verificarDistribuicaoCompleta()
