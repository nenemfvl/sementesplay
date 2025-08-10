const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarDistribuicaoDetalhada() {
  console.log('🔍 Verificando distribuição detalhada do fundo...')

  try {
    // Buscar o fundo distribuído
    const fundo = await prisma.fundoSementes.findFirst({
      where: { distribuido: true },
      include: {
        distribuicoes: {
          include: {
            criador: {
              include: {
                usuario: {
                  select: {
                    nome: true,
                    email: true
                  }
                }
              }
            },
            usuario: {
              select: {
                nome: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { dataInicio: 'desc' }
    })

    if (!fundo) {
      console.log('❌ Nenhum fundo distribuído encontrado')
      return
    }

    console.log(`\n📊 FUNDO DISTRIBUÍDO:`)
    console.log(`   ID: ${fundo.id}`)
    console.log(`   Valor total: R$ ${fundo.valorTotal.toFixed(2)}`)
    console.log(`   Data início: ${fundo.dataInicio.toLocaleString()}`)
    console.log(`   Data fim: ${fundo.dataFim.toLocaleString()}`)
    console.log(`   Total de distribuições: ${fundo.distribuicoes.length}`)

    // Separar distribuições por tipo
    const distribuicoesCriadores = fundo.distribuicoes.filter(d => d.tipo === 'criador')
    const distribuicoesUsuarios = fundo.distribuicoes.filter(d => d.tipo === 'usuario')

    console.log(`\n🎭 DISTRIBUIÇÕES PARA CRIADORES (${distribuicoesCriadores.length}):`)
    let totalCriadores = 0
    for (const dist of distribuicoesCriadores) {
      const nome = dist.criador?.usuario?.nome || 'N/A'
      const email = dist.criador?.usuario?.email || 'N/A'
      const valor = dist.valor.toFixed(2)
      totalCriadores += dist.valor
      console.log(`   • ${nome} (${email}): ${valor} sementes`)
    }
    console.log(`   💰 Total para criadores: ${totalCriadores.toFixed(2)} sementes`)

    console.log(`\n👤 DISTRIBUIÇÕES PARA USUÁRIOS (${distribuicoesUsuarios.length}):`)
    let totalUsuarios = 0
    for (const dist of distribuicoesUsuarios) {
      const nome = dist.usuario?.nome || 'N/A'
      const email = dist.usuario?.email || 'N/A'
      const valor = dist.valor.toFixed(2)
      totalUsuarios += dist.valor
      console.log(`   • ${nome} (${email}): ${valor} sementes`)
    }
    console.log(`   💰 Total para usuários: ${totalUsuarios.toFixed(2)} sementes`)

    console.log(`\n📊 RESUMO:`)
    console.log(`   💰 Valor total do fundo: R$ ${fundo.valorTotal.toFixed(2)}`)
    console.log(`   🎭 Sementes para criadores: ${totalCriadores.toFixed(2)}`)
    console.log(`   👤 Sementes para usuários: ${totalUsuarios.toFixed(2)}`)
    console.log(`   ✅ Total distribuído: ${(totalCriadores + totalUsuarios).toFixed(2)}`)

    // Verificar se há discrepância
    const diferenca = Math.abs((totalCriadores + totalUsuarios) - fundo.valorTotal)
    if (diferenca > 0.01) {
      console.log(`   ⚠️  DIFERENÇA ENCONTRADA: ${diferenca.toFixed(2)}`)
    } else {
      console.log(`   ✅ Distribuição balanceada corretamente`)
    }

  } catch (error) {
    console.error('❌ Erro durante verificação:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarDistribuicaoDetalhada()
