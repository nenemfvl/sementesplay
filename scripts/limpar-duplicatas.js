const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function limparDuplicatas() {
  try {
    console.log('🧹 LIMPANDO DISTRIBUIÇÕES DUPLICADAS\n')

    // 1. Verificar distribuições duplicadas
    const distribuicoes = await prisma.distribuicaoFundo.findMany({
      include: {
        criador: {
          include: {
            usuario: {
              select: { nome: true }
            }
          }
        },
        usuario: {
          select: { nome: true }
        }
      },
      orderBy: {
        data: 'asc'
      }
    })

    console.log('1️⃣ DISTRIBUIÇÕES ATUAIS:')
    distribuicoes.forEach((dist, index) => {
      if (dist.tipo === 'criador') {
        console.log(`   ${index + 1}. Criador: ${dist.criador.usuario.nome} - R$ ${dist.valor.toFixed(2)} - ${dist.data.toLocaleString()}`)
      } else {
        console.log(`   ${index + 1}. Usuário: ${dist.usuario.nome} - R$ ${dist.valor.toFixed(2)} - ${dist.data.toLocaleString()}`)
      }
    })

    // 2. Identificar duplicatas
    console.log('\n2️⃣ IDENTIFICANDO DUPLICATAS:')
    const duplicatas = []
    
    for (let i = 0; i < distribuicoes.length; i++) {
      for (let j = i + 1; j < distribuicoes.length; j++) {
        const dist1 = distribuicoes[i]
        const dist2 = distribuicoes[j]
        
        if (dist1.tipo === dist2.tipo && 
            dist1.valor === dist2.valor &&
            ((dist1.tipo === 'criador' && dist1.criadorId === dist2.criadorId) ||
             (dist1.tipo === 'usuario' && dist1.usuarioId === dist2.usuarioId))) {
          duplicatas.push({ primeira: dist1, segunda: dist2 })
        }
      }
    }

    if (duplicatas.length === 0) {
      console.log('✅ Nenhuma duplicata encontrada')
      return
    }

    console.log(`📊 Duplicatas encontradas: ${duplicatas.length}`)
    duplicatas.forEach((dup, index) => {
      console.log(`   Duplicata ${index + 1}:`)
      if (dup.primeira.tipo === 'criador') {
        console.log(`     • ${dup.primeira.criador.usuario.nome} - R$ ${dup.primeira.valor.toFixed(2)}`)
        console.log(`     • ${dup.segunda.criador.usuario.nome} - R$ ${dup.segunda.valor.toFixed(2)}`)
      } else {
        console.log(`     • ${dup.primeira.usuario.nome} - R$ ${dup.primeira.valor.toFixed(2)}`)
        console.log(`     • ${dup.segunda.usuario.nome} - R$ ${dup.segunda.valor.toFixed(2)}`)
      }
    })

    // 3. Remover duplicatas (manter a primeira, remover a segunda)
    console.log('\n3️⃣ REMOVENDO DUPLICATAS:')
    
    for (const dup of duplicatas) {
      // Reverter sementes da duplicata
      if (dup.segunda.tipo === 'criador') {
        await prisma.usuario.update({
          where: { id: dup.segunda.criador.usuarioId },
          data: { sementes: { decrement: dup.segunda.valor } }
        })
        console.log(`   • Revertido ${dup.segunda.valor.toFixed(2)} sementes do criador ${dup.segunda.criador.usuario.nome}`)
      } else {
        await prisma.usuario.update({
          where: { id: dup.segunda.usuarioId },
          data: { sementes: { decrement: dup.segunda.valor } }
        })
        console.log(`   • Revertido ${dup.segunda.valor.toFixed(2)} sementes do usuário ${dup.segunda.usuario.nome}`)
      }
      
      // Remover a distribuição duplicada
      await prisma.distribuicaoFundo.delete({
        where: { id: dup.segunda.id }
      })
      console.log(`   • Removida distribuição duplicada ID: ${dup.segunda.id}`)
    }

    // 4. Verificar resultado
    console.log('\n4️⃣ VERIFICANDO RESULTADO:')
    const distribuicoesFinais = await prisma.distribuicaoFundo.findMany({
      include: {
        criador: {
          include: {
            usuario: {
              select: { nome: true }
            }
          }
        },
        usuario: {
          select: { nome: true }
        }
      },
      orderBy: {
        data: 'asc'
      }
    })

    console.log(`📊 Distribuições finais: ${distribuicoesFinais.length}`)
    let totalDistribuido = 0
    distribuicoesFinais.forEach((dist, index) => {
      totalDistribuido += dist.valor
      if (dist.tipo === 'criador') {
        console.log(`   ${index + 1}. Criador: ${dist.criador.usuario.nome} - R$ ${dist.valor.toFixed(2)}`)
      } else {
        console.log(`   ${index + 1}. Usuário: ${dist.usuario.nome} - R$ ${dist.valor.toFixed(2)}`)
      }
    })

    console.log(`📊 Total distribuído: R$ ${totalDistribuido.toFixed(2)}`)

    // 5. Verificar fundo
    const fundo = await prisma.fundoSementes.findFirst({
      where: { distribuido: true }
    })

    if (fundo) {
      console.log(`📊 Valor do fundo: R$ ${fundo.valorTotal.toFixed(2)}`)
      const diferenca = Math.abs(totalDistribuido - fundo.valorTotal)
      console.log(`📊 Diferença: R$ ${diferenca.toFixed(2)}`)
      
      if (diferenca < 0.01) {
        console.log('✅ Distribuição corrigida com sucesso!')
      } else {
        console.log('❌ Ainda há inconsistência na distribuição')
      }
    }

    console.log('\n🎉 LIMPEZA CONCLUÍDA!')

  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar a limpeza
limparDuplicatas()
