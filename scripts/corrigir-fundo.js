const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function corrigirFundo() {
  try {
    console.log('🔧 CORRIGINDO DISTRIBUIÇÃO DO FUNDO\n')

    // 1. Verificar fundo atual
    const fundo = await prisma.fundoSementes.findFirst({
      where: { distribuido: true },
      orderBy: { dataInicio: 'desc' }
    })

    if (!fundo) {
      console.log('❌ Nenhum fundo distribuído encontrado')
      return
    }

    console.log('1️⃣ FUNDO ATUAL:')
    console.log(`   • ID: ${fundo.id}`)
    console.log(`   • Valor: R$ ${fundo.valorTotal.toFixed(2)}`)
    console.log(`   • Data início: ${fundo.dataInicio.toLocaleString()}`)
    console.log(`   • Data fim: ${fundo.dataFim.toLocaleString()}`)

    // 2. Verificar compras existentes
    const todasCompras = await prisma.compraParceiro.findMany({
      where: {
        status: 'cashback_liberado'
      },
      orderBy: {
        dataCompra: 'asc'
      }
    })

    if (todasCompras.length === 0) {
      console.log('❌ Nenhuma compra com cashback liberado encontrada')
      return
    }

    const dataPrimeiraCompra = todasCompras[0].dataCompra
    const dataUltimaCompra = todasCompras[todasCompras.length - 1].dataCompra

    console.log('\n2️⃣ COMPRAS EXISTENTES:')
    console.log(`   • Primeira compra: ${dataPrimeiraCompra.toLocaleString()}`)
    console.log(`   • Última compra: ${dataUltimaCompra.toLocaleString()}`)
    console.log(`   • Total de compras: ${todasCompras.length}`)

    // 3. Corrigir datas do fundo
    console.log('\n3️⃣ CORRIGINDO DATAS DO FUNDO:')
    
    // Marcar fundo como não distribuído para poder redistribuir
    await prisma.fundoSementes.update({
      where: { id: fundo.id },
      data: { 
        distribuido: false,
        dataInicio: dataPrimeiraCompra,
        dataFim: dataUltimaCompra
      }
    })

    console.log('✅ Fundo marcado como não distribuído')
    console.log(`✅ Datas atualizadas: ${dataPrimeiraCompra.toLocaleString()} → ${dataUltimaCompra.toLocaleString()}`)

    // 4. Remover distribuições anteriores
    console.log('\n4️⃣ REMOVENDO DISTRIBUIÇÕES ANTERIORES:')
    const distribuicoesAnteriores = await prisma.distribuicaoFundo.findMany({
      where: { fundoId: fundo.id },
      include: {
        criador: {
          select: { usuarioId: true }
        },
        usuario: {
          select: { id: true }
        }
      }
    })

    console.log(`📊 Distribuições anteriores: ${distribuicoesAnteriores.length}`)
    
    // Reverter sementes dos usuários
    for (const dist of distribuicoesAnteriores) {
      if (dist.tipo === 'criador' && dist.criador) {
        await prisma.usuario.update({
          where: { id: dist.criador.usuarioId },
          data: { sementes: { decrement: dist.valor } }
        })
        console.log(`   • Revertido ${dist.valor.toFixed(2)} sementes do criador`)
      } else if (dist.tipo === 'usuario' && dist.usuario) {
        await prisma.usuario.update({
          where: { id: dist.usuario.id },
          data: { sementes: { decrement: dist.valor } }
        })
        console.log(`   • Revertido ${dist.valor.toFixed(2)} sementes do usuário`)
      }
    }

    // Remover distribuições
    await prisma.distribuicaoFundo.deleteMany({
      where: { fundoId: fundo.id }
    })

    console.log('✅ Distribuições anteriores removidas')

    // 5. Executar nova distribuição
    console.log('\n5️⃣ EXECUTANDO NOVA DISTRIBUIÇÃO:')
    
    const response = await fetch('http://localhost:3000/api/admin/distribuir-fundo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const resultado = await response.json()
      console.log('✅ Nova distribuição executada com sucesso!')
      console.log(`   Resultado: ${resultado.message}`)
    } else {
      const erro = await response.json()
      console.log('❌ Erro na nova distribuição:')
      console.log(`   ${erro.error}`)
    }

    // 6. Verificar resultado final
    console.log('\n6️⃣ VERIFICANDO RESULTADO FINAL:')
    
    const fundoCorrigido = await prisma.fundoSementes.findUnique({
      where: { id: fundo.id },
      include: {
        distribuicoes: true
      }
    })

    console.log(`📊 Fundo distribuído: ${fundoCorrigido.distribuido}`)
    console.log(`📋 Total de distribuições: ${fundoCorrigido.distribuicoes.length}`)

    let totalDistribuido = 0
    fundoCorrigido.distribuicoes.forEach(dist => {
      totalDistribuido += dist.valor
      console.log(`   • ${dist.tipo}: R$ ${dist.valor.toFixed(2)}`)
    })

    console.log(`📊 Total distribuído: R$ ${totalDistribuido.toFixed(2)}`)
    console.log(`📊 Valor do fundo: R$ ${fundoCorrigido.valorTotal.toFixed(2)}`)
    console.log(`📊 Diferença: R$ ${(fundoCorrigido.valorTotal - totalDistribuido).toFixed(2)}`)

    if (Math.abs(fundoCorrigido.valorTotal - totalDistribuido) < 0.01) {
      console.log('✅ Distribuição corrigida com sucesso!')
    } else {
      console.log('❌ Ainda há inconsistência na distribuição')
    }

    console.log('\n🎉 CORREÇÃO CONCLUÍDA!')

  } catch (error) {
    console.error('❌ Erro durante a correção:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar a correção
corrigirFundo()
