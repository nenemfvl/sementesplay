const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function configurarFundoTeste() {
  try {
    console.log('🔧 CONFIGURANDO FUNDO DE TESTE PARA DISTRIBUIÇÃO AUTOMÁTICA\n');

    // 1. Verificar se já existe fundo pendente
    const fundoExistente = await prisma.fundoSementes.findFirst({
      where: { distribuido: false }
    });

    if (fundoExistente) {
      console.log('⚠️ Já existe um fundo pendente:');
      console.log(`   • ID: ${fundoExistente.id}`);
      console.log(`   • Valor: R$ ${fundoExistente.valorTotal.toFixed(2)}`);
      console.log(`   • Período: ${fundoExistente.dataInicio.toLocaleDateString()} a ${fundoExistente.dataFim.toLocaleDateString()}`);
      
      const resposta = await new Promise((resolve) => {
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        rl.question('Deseja criar um novo fundo mesmo assim? (s/n): ', (answer) => {
          rl.close();
          resolve(answer.toLowerCase() === 's');
        });
      });

      if (!resposta) {
        console.log('❌ Operação cancelada');
        return;
      }
    }

    // 2. Criar fundo de teste
    const agora = new Date();
    const dataInicio = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 dias atrás
    const dataFim = new Date(agora.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 dia atrás

    const fundoTeste = await prisma.fundoSementes.create({
      data: {
        ciclo: 999, // Ciclo de teste
        valorTotal: 50.00, // R$ 50,00 para teste
        dataInicio,
        dataFim,
        distribuido: false
      }
    });

    console.log('✅ Fundo de teste criado:');
    console.log(`   • ID: ${fundoTeste.id}`);
    console.log(`   • Ciclo: ${fundoTeste.ciclo}`);
    console.log(`   • Valor: R$ ${fundoTeste.valorTotal.toFixed(2)}`);
    console.log(`   • Período: ${dataInicio.toLocaleDateString()} a ${dataFim.toLocaleDateString()}`);
    console.log(`   • Status: Pendente de distribuição`);

    // 3. Verificar elegibilidade
    console.log('\n📊 VERIFICANDO ELEGIBILIDADE:');

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
          gte: dataInicio,
          lte: dataFim
        },
        status: 'cashback_liberado'
      }
    });

    console.log(`👤 Usuários elegíveis: ${compras.length}`);

    // 4. Calcular distribuição esperada
    const valorCriadores = fundoTeste.valorTotal * 0.5;
    const valorUsuarios = fundoTeste.valorTotal * 0.5;
    const totalConteudos = criadores.reduce((sum, criador) => sum + criador._count.conteudos, 0);

    console.log('\n💰 DISTRIBUIÇÃO ESPERADA:');
    console.log(`   • Valor para criadores: R$ ${valorCriadores.toFixed(2)}`);
    console.log(`   • Valor para usuários: R$ ${valorUsuarios.toFixed(2)}`);

    console.log('\n📋 DISTRIBUIÇÃO PARA CRIADORES:');
    criadores.forEach(criador => {
      const proporcao = totalConteudos > 0 ? criador._count.conteudos / totalConteudos : 0;
      const valorCriador = valorCriadores * proporcao;
      console.log(`   • ${criador.nome}: R$ ${valorCriador.toFixed(2)}`);
    });

    if (compras.length === 0) {
      console.log('\n⚠️ ATENÇÃO: Nenhum usuário elegível encontrado!');
      console.log('   Todo o valor será distribuído apenas para criadores.');
    }

    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('   1. Execute: node scripts/testar-distribuicao-automatica.js');
    console.log('   2. Ou aguarde o cron job automático (todos os dias às 2h)');
    console.log('   3. Verifique as notificações dos usuários');

    console.log('\n✅ CONFIGURAÇÃO CONCLUÍDA!');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar configuração
configurarFundoTeste();
