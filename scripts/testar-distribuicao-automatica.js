const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testarDistribuicaoAutomatica() {
  try {
    console.log('🧪 TESTANDO SISTEMA DE DISTRIBUIÇÃO AUTOMÁTICA\n');

    // 1. Verificar fundos atuais
    console.log('1️⃣ VERIFICANDO FUNDOS ATUAIS:');
    const fundos = await prisma.fundoSementes.findMany({
      orderBy: { dataInicio: 'desc' }
    });

    console.log(`📊 Total de fundos: ${fundos.length}`);
    fundos.forEach((fundo, index) => {
      console.log(`   Fundo ${index + 1}:`);
      console.log(`   • ID: ${fundo.id}`);
      console.log(`   • Ciclo: ${fundo.ciclo}`);
      console.log(`   • Valor: R$ ${fundo.valorTotal.toFixed(2)}`);
      console.log(`   • Período: ${fundo.dataInicio.toLocaleDateString()} a ${fundo.dataFim.toLocaleDateString()}`);
      console.log(`   • Distribuído: ${fundo.distribuido ? '✅ Sim' : '❌ Não'}`);
      console.log('');
    });

    // 2. Verificar se há fundo pendente
    const fundoPendente = await prisma.fundoSementes.findFirst({
      where: { distribuido: false },
      orderBy: { dataInicio: 'desc' }
    });

    if (!fundoPendente) {
      console.log('ℹ️ Nenhum fundo pendente encontrado');
      return;
    }

    console.log('2️⃣ FUNDO PENDENTE ENCONTRADO:');
    console.log(`   • ID: ${fundoPendente.id}`);
    console.log(`   • Valor: R$ ${fundoPendente.valorTotal.toFixed(2)}`);
    console.log(`   • Período: ${fundoPendente.dataInicio.toLocaleDateString()} a ${fundoPendente.dataFim.toLocaleDateString()}`);
    
    const agora = new Date();
    const periodoTerminou = fundoPendente.dataFim <= agora;
    console.log(`   • Período terminou: ${periodoTerminou ? '✅ Sim' : '❌ Não'}`);
    console.log(`   • Data atual: ${agora.toLocaleDateString()}`);

    // 3. Verificar elegibilidade
    console.log('\n3️⃣ VERIFICANDO ELEGIBILIDADE:');

    // Criadores
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
    });

    console.log(`👨‍🎨 Criadores elegíveis: ${criadores.length}`);
    criadores.forEach(criador => {
      console.log(`   • ${criador.nome}: ${criador._count.conteudos} conteúdos`);
    });

    // Usuários
    const compras = await prisma.compraParceiro.findMany({
      where: {
        dataCompra: {
          gte: fundoPendente.dataInicio,
          lte: fundoPendente.dataFim
        },
        status: 'cashback_liberado'
      },
      select: { usuarioId: true, valorCompra: true }
    });

    const usuariosUnicos = Array.from(new Set(compras.map(c => c.usuarioId)));
    console.log(`👤 Usuários elegíveis: ${usuariosUnicos.length}`);
    
    if (compras.length > 0) {
      let totalGasto = 0;
      compras.forEach(compra => {
        totalGasto += compra.valorCompra;
      });
      console.log(`💰 Total gasto por usuários: R$ ${totalGasto.toFixed(2)}`);
    }

    // 4. Simular distribuição
    console.log('\n4️⃣ SIMULANDO DISTRIBUIÇÃO:');
    
    const valorCriadores = fundoPendente.valorTotal * 0.5;
    const valorUsuarios = fundoPendente.valorTotal * 0.5;
    
    console.log(`📊 Valor para criadores: R$ ${valorCriadores.toFixed(2)}`);
    console.log(`📊 Valor para usuários: R$ ${valorUsuarios.toFixed(2)}`);

    const totalConteudos = criadores.reduce((sum, criador) => sum + criador._count.conteudos, 0);
    
    console.log('\n📋 DISTRIBUIÇÃO PARA CRIADORES:');
    criadores.forEach(criador => {
      const proporcao = totalConteudos > 0 ? criador._count.conteudos / totalConteudos : 0;
      const valorCriador = valorCriadores * proporcao;
      console.log(`   • ${criador.nome}: ${criador._count.conteudos} conteúdos = R$ ${valorCriador.toFixed(2)}`);
    });

    console.log('\n📋 DISTRIBUIÇÃO PARA USUÁRIOS:');
    if (usuariosUnicos.length > 0) {
      let totalGasto = 0;
      const gastoPorUsuario = {};
      for (const compra of compras) {
        gastoPorUsuario[compra.usuarioId] = (gastoPorUsuario[compra.usuarioId] || 0) + compra.valorCompra;
        totalGasto += compra.valorCompra;
      }

      for (const usuarioId of usuariosUnicos) {
        const proporcao = gastoPorUsuario[usuarioId] / totalGasto;
        const valorUsuario = valorUsuarios * proporcao;
        console.log(`   • Usuário ${usuarioId}: R$ ${gastoPorUsuario[usuarioId].toFixed(2)} gasto = R$ ${valorUsuario.toFixed(2)}`);
      }
    } else {
      console.log('   ❌ Nenhum usuário elegível (sem compras)');
      console.log(`   💡 Todo o valor (R$ ${fundoPendente.valorTotal.toFixed(2)}) será distribuído apenas para criadores`);
    }

    // 5. Testar API
    console.log('\n5️⃣ TESTANDO API DE DISTRIBUIÇÃO AUTOMÁTICA:');
    
    if (periodoTerminou) {
      console.log('✅ Período terminou, executando distribuição...');
      
      const response = await fetch('http://localhost:3000/api/cron/distribuir-fundo-automatico', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const resultado = await response.json();
        console.log('✅ Distribuição executada com sucesso!');
        console.log(`   Resultado: ${resultado.message}`);
        if (resultado.resultado) {
          console.log(`   • Criadores: ${resultado.resultado.distribuicoesCriadores} distribuições`);
          console.log(`   • Usuários: ${resultado.resultado.distribuicoesUsuarios} distribuições`);
          console.log(`   • Total distribuído: R$ ${resultado.resultado.totalDistribuido.toFixed(2)}`);
        }
      } else {
        const erro = await response.json();
        console.log('❌ Erro na distribuição:');
        console.log(`   ${erro.error}`);
      }
    } else {
      console.log('⏰ Período ainda não terminou, aguardando...');
    }

    console.log('\n🎉 TESTE CONCLUÍDO!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testarDistribuicaoAutomatica();
