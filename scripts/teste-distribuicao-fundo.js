const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testeDistribuicaoFundo() {
  try {
    console.log('🧪 INICIANDO TESTE DE DISTRIBUIÇÃO DO FUNDO\n')

    // 1. Verificar fundo atual
    console.log('1️⃣ VERIFICANDO FUNDO ATUAL:')
    const fundoAtual = await prisma.fundoSementes.findFirst({
      where: { distribuido: false },
      include: {
        distribuicoes: true
      }
    })

    if (!fundoAtual) {
      console.log('❌ Nenhum fundo pendente de distribuição encontrado')
      console.log('💡 Criando fundo de teste...')
      
      // Criar fundo de teste
      const fundoTeste = await prisma.fundoSementes.create({
        data: {
          ciclo: 1,
          valorTotal: 100.00, // R$ 100,00 para teste
          dataInicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
          dataFim: new Date(),
          distribuido: false
        }
      })
      console.log(`✅ Fundo de teste criado: R$ ${fundoTeste.valorTotal.toFixed(2)}`)
    } else {
      console.log(`✅ Fundo encontrado: R$ ${fundoAtual.valorTotal.toFixed(2)}`)
      console.log(`   ID: ${fundoAtual.id}`)
      console.log(`   Distribuído: ${fundoAtual.distribuido}`)
      console.log(`   Distribuições: ${fundoAtual.distribuicoes.length}`)
    }

    // 2. Verificar criadores ativos
    console.log('\n2️⃣ VERIFICANDO CRIADORES ATIVOS:')
    const criadores = await prisma.criador.findMany({
      include: {
        _count: {
          select: { conteudos: true }
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            sementes: true
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
    criadores.forEach((criador, index) => {
      console.log(`   ${index + 1}. ${criador.usuario.nome} - ${criador._count.conteudos} conteúdos - ${criador.usuario.sementes} sementes`)
    })

    // 3. Verificar compras de parceiros
    console.log('\n3️⃣ VERIFICANDO COMPRAS DE PARCEIROS:')
    const compras = await prisma.compraParceiro.findMany({
      where: {
        status: 'cashback_liberado'
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            sementes: true
          }
        }
      }
    })

    console.log(`📊 Compras com cashback liberado: ${compras.length}`)
    const gastoPorUsuario = {}
    let totalGasto = 0
    
    compras.forEach(compra => {
      gastoPorUsuario[compra.usuarioId] = (gastoPorUsuario[compra.usuarioId] || 0) + compra.valorCompra
      totalGasto += compra.valorCompra
    })

    Object.keys(gastoPorUsuario).forEach(usuarioId => {
      const compra = compras.find(c => c.usuarioId === usuarioId)
      console.log(`   • ${compra.usuario.nome}: R$ ${gastoPorUsuario[usuarioId].toFixed(2)} - ${compra.usuario.sementes} sementes`)
    })

    // 4. Simular distribuição
    console.log('\n4️⃣ SIMULANDO DISTRIBUIÇÃO:')
    const fundo = fundoAtual || await prisma.fundoSementes.findFirst({ where: { distribuido: false } })
    
    if (!fundo) {
      console.log('❌ Nenhum fundo disponível para distribuição')
      return
    }

    const valorCriadores = fundo.valorTotal * 0.5 // 50% para criadores
    const valorUsuarios = fundo.valorTotal * 0.5  // 50% para usuários

    console.log(`💰 Valor total do fundo: R$ ${fundo.valorTotal.toFixed(2)}`)
    console.log(`   • Criadores (50%): R$ ${valorCriadores.toFixed(2)}`)
    console.log(`   • Usuários (50%): R$ ${valorUsuarios.toFixed(2)}`)

    // Calcular distribuição para criadores
    const totalConteudos = criadores.reduce((sum, criador) => sum + criador._count.conteudos, 0)
    console.log(`📊 Total de conteúdos: ${totalConteudos}`)

    console.log('\n📋 DISTRIBUIÇÃO PARA CRIADORES:')
    criadores.forEach(criador => {
      const proporcao = totalConteudos > 0 ? criador._count.conteudos / totalConteudos : 0
      const valorCriador = valorCriadores * proporcao
      console.log(`   • ${criador.usuario.nome}: ${criador._count.conteudos} conteúdos = R$ ${valorCriador.toFixed(2)}`)
    })

    // Calcular distribuição para usuários
    const usuariosUnicos = Array.from(new Set(compras.map(c => c.usuarioId)))
    console.log(`\n📋 DISTRIBUIÇÃO PARA USUÁRIOS:`)
    usuariosUnicos.forEach(usuarioId => {
      const proporcao = gastoPorUsuario[usuarioId] / totalGasto
      const valorUsuario = valorUsuarios * proporcao
      const compra = compras.find(c => c.usuarioId === usuarioId)
      console.log(`   • ${compra.usuario.nome}: R$ ${gastoPorUsuario[usuarioId].toFixed(2)} gasto = R$ ${valorUsuario.toFixed(2)}`)
    })

    // 5. Executar distribuição real
    console.log('\n5️⃣ EXECUTANDO DISTRIBUIÇÃO REAL:')
    console.log('⚠️  ATENÇÃO: Esta operação irá distribuir o fundo real!')
    
    // Fazer a requisição para a API de distribuição
    const response = await fetch('http://localhost:3000/api/admin/distribuir-fundo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const resultado = await response.json()
      console.log('✅ Distribuição executada com sucesso!')
      console.log(`   Resultado: ${resultado.message}`)
    } else {
      const erro = await response.json()
      console.log('❌ Erro na distribuição:')
      console.log(`   ${erro.error}`)
    }

    // 6. Verificar resultado
    console.log('\n6️⃣ VERIFICANDO RESULTADO:')
    
    // Verificar fundo distribuído
    const fundoDistribuido = await prisma.fundoSementes.findFirst({
      where: { id: fundo.id },
      include: {
        distribuicoes: true
      }
    })

    console.log(`📊 Fundo distribuído: ${fundoDistribuido.distribuido}`)
    console.log(`📋 Total de distribuições: ${fundoDistribuido.distribuicoes.length}`)

    // Verificar sementes dos usuários após distribuição
    console.log('\n📊 SEMENTES APÓS DISTRIBUIÇÃO:')
    
    // Criadores
    console.log('👨‍🎨 Criadores:')
    for (const criador of criadores) {
      const usuarioAtualizado = await prisma.usuario.findUnique({
        where: { id: criador.usuario.id },
        select: { sementes: true }
      })
      const diferenca = usuarioAtualizado.sementes - criador.usuario.sementes
      console.log(`   • ${criador.usuario.nome}: ${criador.usuario.sementes} → ${usuarioAtualizado.sementes} (+${diferenca.toFixed(2)})`)
    }

    // Usuários
    console.log('\n👤 Usuários:')
    for (const usuarioId of usuariosUnicos) {
      const compra = compras.find(c => c.usuarioId === usuarioId)
      const usuarioAtualizado = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { sementes: true }
      })
      const diferenca = usuarioAtualizado.sementes - compra.usuario.sementes
      console.log(`   • ${compra.usuario.nome}: ${compra.usuario.sementes} → ${usuarioAtualizado.sementes} (+${diferenca.toFixed(2)})`)
    }

    // 7. Verificar notificações
    console.log('\n7️⃣ VERIFICANDO NOTIFICAÇÕES:')
    const notificacoes = await prisma.notificacao.findMany({
      where: {
        tipo: 'fundo',
        data: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Últimos 5 minutos
        }
      },
      include: {
        usuario: {
          select: { nome: true }
        }
      },
      orderBy: { data: 'desc' }
    })

    console.log(`📧 Notificações de fundo enviadas: ${notificacoes.length}`)
    notificacoes.forEach(notif => {
      console.log(`   • ${notif.usuario.nome}: ${notif.titulo}`)
    })

    console.log('\n🎉 TESTE DE DISTRIBUIÇÃO CONCLUÍDO!')

  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o teste
testeDistribuicaoFundo()
