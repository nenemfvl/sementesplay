// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// async function verificarRepassePago() {
  console.log('🔍 Verificando repasse com status "pago"...')

  try {
    // Buscar repasse com status "pago"
    const repassePago = await prisma.repasseParceiro.findFirst({
      where: { status: 'pago' },
      include: {
        compra: {
          include: {
            usuario: true,
            parceiro: true
          }
        }
      }
    })

    if (!repassePago) {
      console.log('❌ Nenhum repasse com status "pago" encontrado')
      return
    }

    console.log(`\n🔍 Repasse ID: ${repassePago.id}`)
    console.log(`   Status: ${repassePago.status}`)
    console.log(`   Valor: R$ ${repassePago.valor}`)
    console.log(`   Usuário: ${repassePago.compra.usuario.nome}`)
    console.log(`   Parceiro: ${repassePago.compra.parceiro.nome}`)
    console.log(`   Data: ${repassePago.dataRepasse.toLocaleString()}`)

    // Calcular distribuição esperada (fluxo automático)
    const valor = repassePago.valor
    const pctUsuario = valor * 0.50    // 50% para jogador (em sementes)
    const pctFundo = valor * 0.25      // 25% para fundo

    console.log(`\n📊 Distribuição esperada (fluxo automático):`)
    console.log(`   • Usuário: ${pctUsuario} sementes (50%)`)
    console.log(`   • Fundo: R$ ${pctFundo.toFixed(2)} (25%)`)

    // Verificar se o usuário recebeu as sementes
    const usuario = await prisma.usuario.findUnique({
      where: { id: repassePago.compra.usuarioId }
    })

    console.log(`\n💰 Sementes atuais do usuário: ${usuario.sementes}`)

    // Verificar histórico de sementes
    const historicoSementes = await prisma.semente.findMany({
      where: {
        usuarioId: repassePago.compra.usuarioId,
        descricao: {
          contains: `Cashback compra parceiro ${repassePago.compraId}`
        }
      },
      orderBy: {
        data: 'desc'
      }
    })

    console.log(`\n📋 Histórico de sementes:`)
    if (historicoSementes.length > 0) {
      historicoSementes.forEach(s => {
        console.log(`   • ${s.quantidade} sementes - ${s.tipo} - ${s.descricao}`)
      })
    } else {
      console.log(`   ❌ Nenhum histórico encontrado!`)
    }

    // Verificar fundo de sementes
    const fundoAtual = await prisma.fundoSementes.findFirst({
      where: { distribuido: false }
    })

    console.log(`\n💰 Fundo de sementes atual:`)
    if (fundoAtual) {
      console.log(`   Valor total: R$ ${fundoAtual.valorTotal.toFixed(2)}`)
      console.log(`   Esperado: R$ ${pctFundo.toFixed(2)}`)
    } else {
      console.log(`   Nenhum fundo pendente`)
    }

    // Verificar se há inconsistência
    const sementesEsperadas = pctUsuario
    const sementesAtuais = usuario.sementes

    console.log(`\n🔍 ANÁLISE:`)
    console.log(`   Sementes esperadas: ${sementesEsperadas}`)
    console.log(`   Sementes atuais: ${sementesAtuais}`)
    console.log(`   Diferença: ${sementesAtuais - sementesEsperadas}`)

    if (Math.abs(sementesAtuais - sementesEsperadas) < 0.01) {
      console.log(`   ✅ Distribuição correta!`)
    } else {
      console.log(`   ❌ Inconsistência detectada!`)
    }

//   } catch (error) {
//     console.error('❌ Erro durante verificação:', error)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// verificarRepassePago() 