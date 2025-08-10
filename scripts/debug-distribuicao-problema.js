const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugDistribuicao() {
  console.log('🔍 Debugando problema na distribuição...')

  try {
    // Verificar se há criadores
    const criadores = await prisma.criador.findMany({
      include: {
        _count: {
          select: { conteudos: true }
        },
        usuario: {
          select: {
            nome: true,
            email: true
          }
        }
      }
    })

    console.log(`\n🎭 CRIADORES ENCONTRADOS (${criadores.length}):`)
    for (const criador of criadores) {
      console.log(`   • ${criador.usuario.nome} (${criador.usuario.email}): ${criador._count.conteudos} conteúdos`)
    }

    // Verificar se há compras de parceiros
    const compras = await prisma.compraParceiro.findMany({
      where: {
        status: 'cashback_liberado'
      },
      select: {
        usuarioId: true,
        valorCompra: true,
        dataCompra: true
      }
    })

    console.log(`\n🛒 COMPRAS DE PARCEIROS (${compras.length}):`)
    for (const compra of compras) {
      console.log(`   • Usuário ${compra.usuarioId}: R$ ${compra.valorCompra.toFixed(2)} - ${compra.dataCompra.toLocaleString()}`)
    }

    // Verificar o fundo específico
    const fundo = await prisma.fundoSementes.findUnique({
      where: { id: 'cme3f0ise000elf044qhm0anp' }
    })

    console.log(`\n📊 FUNDO ESPECÍFICO:`)
    console.log(`   ID: ${fundo.id}`)
    console.log(`   Valor: R$ ${fundo.valorTotal.toFixed(2)}`)
    console.log(`   Data início: ${fundo.dataInicio.toLocaleString()}`)
    console.log(`   Data fim: ${fundo.dataFim.toLocaleString()}`)
    console.log(`   Distribuído: ${fundo.distribuido}`)

    // Verificar se há distribuições com esse fundo
    const distribuicoes = await prisma.distribuicaoFundo.findMany({
      where: { fundoId: fundo.id }
    })

    console.log(`\n📋 DISTRIBUIÇÕES ENCONTRADAS: ${distribuicoes.length}`)
    for (const dist of distribuicoes) {
      console.log(`   • ${dist.valor.toFixed(2)} sementes - ${dist.tipo} - ${dist.data.toLocaleString()}`)
    }

    // Verificar se há usuários com sementes
    const usuariosComSementes = await prisma.usuario.findMany({
      where: {
        sementes: { gt: 0 }
      },
      select: {
        nome: true,
        email: true,
        sementes: true
      }
    })

    console.log(`\n👤 USUÁRIOS COM SEMENTES (${usuariosComSementes.length}):`)
    for (const usuario of usuariosComSementes) {
      console.log(`   • ${usuario.nome} (${usuario.email}): ${usuario.sementes} sementes`)
    }

  } catch (error) {
    console.error('❌ Erro durante debug:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugDistribuicao()
