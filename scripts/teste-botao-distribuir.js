const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testeBotaoDistribuir() {
  try {
    console.log('🧪 TESTE DO BOTÃO DISTRIBUIR FUNDOS\n')

    // 1. Verificar se há fundo pendente
    console.log('1️⃣ VERIFICANDO FUNDO PENDENTE:')
    const fundoPendente = await prisma.fundoSementes.findFirst({
      where: { distribuido: false }
    })

    if (fundoPendente) {
      console.log(`✅ Fundo pendente encontrado:`)
      console.log(`   • ID: ${fundoPendente.id}`)
      console.log(`   • Valor: R$ ${fundoPendente.valorTotal.toFixed(2)}`)
      console.log(`   • Data início: ${fundoPendente.dataInicio.toLocaleString()}`)
      console.log(`   • Data fim: ${fundoPendente.dataFim.toLocaleString()}`)
    } else {
      console.log('❌ Nenhum fundo pendente encontrado')
      console.log('💡 Criando fundo de teste...')
      
      // Criar fundo de teste
      const fundoTeste = await prisma.fundoSementes.create({
        data: {
          ciclo: 2,
          valorTotal: 50.00, // R$ 50,00 para teste
          dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
          dataFim: new Date(),
          distribuido: false
        }
      })
      console.log(`✅ Fundo de teste criado: R$ ${fundoTeste.valorTotal.toFixed(2)}`)
    }

    // 2. Verificar dados que aparecem no painel
    console.log('\n2️⃣ VERIFICANDO DADOS DO PAINEL:')
    
    // Compras aguardando repasse
    const comprasAguardando = await prisma.compraParceiro.findMany({
      where: { status: 'aguardando_repasse' },
      include: { parceiro: true }
    })
    console.log(`📊 Compras aguardando repasse: ${comprasAguardando.length}`)

    // Repasses pendentes
    const repassesPendentes = await prisma.repasseParceiro.findMany({
      where: { status: 'pendente' },
      include: { 
        parceiro: true, 
        compra: {
          include: {
            usuario: true
          }
        }
      }
    })
    console.log(`📊 Repasses pendentes: ${repassesPendentes.length}`)

    // Fundo atual
    const fundoAtual = await prisma.fundoSementes.findFirst({ 
      where: { distribuido: false } 
    })
    console.log(`📊 Fundo atual: ${fundoAtual ? `R$ ${fundoAtual.valorTotal.toFixed(2)}` : 'Nenhum'}`)

    // Denúncias pendentes
    const denunciasPendentes = await prisma.denuncia.findMany({
      where: { status: 'pendente' }
    })
    console.log(`📊 Denúncias pendentes: ${denunciasPendentes.length}`)

    // 3. Testar API do painel
    console.log('\n3️⃣ TESTANDO API DO PAINEL:')
    const response = await fetch('http://localhost:3000/api/admin/painel')
    
    if (response.ok) {
      const dados = await response.json()
      console.log('✅ API do painel funcionando')
      console.log(`   • Fundo atual: ${dados.fundoAtual ? `R$ ${dados.fundoAtual.valorTotal.toFixed(2)}` : 'Nenhum'}`)
      console.log(`   • Compras aguardando: ${dados.comprasAguardando?.length || 0}`)
      console.log(`   • Repasses pendentes: ${dados.repassesPendentes?.length || 0}`)
      console.log(`   • Denúncias pendentes: ${dados.denunciasPendentes?.length || 0}`)
    } else {
      console.log('❌ Erro na API do painel')
      const erro = await response.json()
      console.log(`   Erro: ${erro.error}`)
    }

    // 4. Verificar se o botão deve aparecer
    console.log('\n4️⃣ VERIFICANDO SE O BOTÃO DEVE APARECER:')
    if (fundoAtual) {
      console.log('✅ O botão "Distribuir Fundo" DEVE aparecer')
      console.log('   • Há um fundo não distribuído disponível')
    } else {
      console.log('❌ O botão "Distribuir Fundo" NÃO deve aparecer')
      console.log('   • Não há fundo pendente de distribuição')
    }

    // 5. Verificar condições para distribuição
    console.log('\n5️⃣ VERIFICANDO CONDIÇÕES PARA DISTRIBUIÇÃO:')
    
    // Criadores ativos
    const criadores = await prisma.criador.findMany({
      include: {
        _count: {
          select: { conteudos: true }
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
      console.log(`   • ${criador.usuario?.nome || 'N/A'}: ${criador._count.conteudos} conteúdos`)
    })

    // Compras no período
    if (fundoAtual) {
      const compras = await prisma.compraParceiro.findMany({
        where: {
          dataCompra: {
            gte: fundoAtual.dataInicio,
            lte: fundoAtual.dataFim
          },
          status: 'cashback_liberado'
        }
      })
      console.log(`📊 Compras no período do fundo: ${compras.length}`)
      
      if (compras.length === 0) {
        console.log('⚠️  ATENÇÃO: Nenhuma compra no período do fundo!')
        console.log('   • A distribuição para usuários será zero')
        console.log('   • Apenas criadores receberão sementes')
      }
    }

    // 6. Simular distribuição
    console.log('\n6️⃣ SIMULANDO DISTRIBUIÇÃO:')
    if (fundoAtual) {
      const valorCriadores = fundoAtual.valorTotal * 0.5
      const valorUsuarios = fundoAtual.valorTotal * 0.5
      
      console.log(`💰 Distribuição simulada:`)
      console.log(`   • Total do fundo: R$ ${fundoAtual.valorTotal.toFixed(2)}`)
      console.log(`   • Para criadores (50%): R$ ${valorCriadores.toFixed(2)}`)
      console.log(`   • Para usuários (50%): R$ ${valorUsuarios.toFixed(2)}`)
      
      if (criadores.length === 0) {
        console.log('⚠️  ATENÇÃO: Nenhum criador ativo!')
        console.log('   • A distribuição para criadores será zero')
      }
    }

    // 7. Verificar se há problemas
    console.log('\n7️⃣ ANÁLISE DE PROBLEMAS:')
    
    if (!fundoAtual) {
      console.log('❌ PROBLEMA: Não há fundo para distribuir')
      console.log('💡 SOLUÇÃO: Criar um fundo ou verificar se já foi distribuído')
    } else if (criadores.length === 0) {
      console.log('⚠️  AVISO: Não há criadores ativos')
      console.log('💡 SUGESTÃO: Verificar se há criadores com conteúdo')
    } else {
      console.log('✅ Tudo pronto para distribuição!')
    }

    console.log('\n🎉 TESTE DO BOTÃO CONCLUÍDO!')

  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o teste
testeBotaoDistribuir()
