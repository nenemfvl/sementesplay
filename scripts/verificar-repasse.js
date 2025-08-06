const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verificarRepasse() {
  console.log('🔍 Verificando processamento de repasses...')

  try {
    // 1. Verificar repasses confirmados recentemente
    const repassesConfirmados = await prisma.repasseParceiro.findMany({
      where: {
        status: 'confirmado',
        dataRepasse: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24h
        }
      },
      include: {
        compra: {
          include: {
            usuario: true,
            parceiro: true
          }
        }
      },
      orderBy: {
        dataRepasse: 'desc'
      }
    })

    console.log(`\n📊 Repasses confirmados nas últimas 24h: ${repassesConfirmados.length}`)

    for (const repasse of repassesConfirmados) {
      console.log(`\n🔍 Repasse ID: ${repasse.id}`)
      console.log(`   Valor: R$ ${repasse.valor}`)
      console.log(`   Usuário: ${repasse.compra.usuario.nome}`)
      console.log(`   Parceiro: ${repasse.compra.parceiro.nome}`)
      console.log(`   Data: ${repasse.dataRepasse.toLocaleString()}`)

      // Calcular o que deveria ter sido distribuído
      const pctUsuario = Math.round(repasse.valor * 0.05)    // 5% para jogador
      const pctFundo = repasse.valor * 0.025                 // 2,5% para fundo

      console.log(`   📊 Distribuição esperada:`)
      console.log(`      • Usuário: ${pctUsuario} sementes (5%)`)
      console.log(`      • Fundo: R$ ${pctFundo.toFixed(2)} (2,5%)`)

      // Verificar se o usuário recebeu as sementes
      const usuario = await prisma.usuario.findUnique({
        where: { id: repasse.compra.usuarioId }
      })

      console.log(`   💰 Sementes atuais do usuário: ${usuario.sementes}`)

      // Verificar histórico de sementes
      const historicoSementes = await prisma.semente.findMany({
        where: {
          usuarioId: repasse.compra.usuarioId,
          descricao: {
            contains: `Cashback compra parceiro ${repasse.compraId}`
          }
        },
        orderBy: {
          data: 'desc'
        }
      })

      if (historicoSementes.length > 0) {
        console.log(`   ✅ Histórico encontrado: ${historicoSementes[0].quantidade} sementes`)
      } else {
        console.log(`   ❌ Histórico NÃO encontrado!`)
      }
    }

    // 2. Verificar fundo de sementes atual
    const fundoAtual = await prisma.fundoSementes.findFirst({
      where: { distribuido: false }
    })

    console.log(`\n💰 Fundo de sementes atual:`)
    if (fundoAtual) {
      console.log(`   Valor total: R$ ${fundoAtual.valorTotal.toFixed(2)}`)
      console.log(`   Ciclo: ${fundoAtual.ciclo}`)
      console.log(`   Distribuído: ${fundoAtual.distribuido ? 'Sim' : 'Não'}`)
    } else {
      console.log(`   Nenhum fundo pendente`)
    }

    // 3. Verificar total de sementes em circulação
    const totalSementes = await prisma.usuario.aggregate({
      _sum: {
        sementes: true
      }
    })

    console.log(`\n🌱 Total de sementes em circulação: ${totalSementes._sum.sementes || 0}`)

    // 4. Verificar histórico de sementes por tipo
    const historicoPorTipo = await prisma.semente.groupBy({
      by: ['tipo'],
      _sum: {
        quantidade: true
      }
    })

    console.log(`\n📋 Histórico de sementes por tipo:`)
    historicoPorTipo.forEach(item => {
      console.log(`   ${item.tipo}: ${item._sum.quantidade || 0}`)
    })

  } catch (error) {
    console.error('❌ Erro durante verificação:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verificarRepasse() 