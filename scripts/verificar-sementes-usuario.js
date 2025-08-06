// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function verificarSementesUsuario() {
  console.log('🔍 Verificando sementes do usuário...\n');

  try {
    // Buscar usuário
    const usuario = await prisma.usuario.findFirst({
      where: { nome: 'faafaa' }
    });

    if (!usuario) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log('👤 Dados do usuário:');
    console.log(`   ID: ${usuario.id}`);
    console.log(`   Nome: ${usuario.nome}`);
    console.log(`   Sementes atuais: ${usuario.sementes}`);
    console.log(`   Email: ${usuario.email}\n`);

    // Buscar repasse confirmado
    const repasse = await prisma.repasseParceiro.findFirst({
      where: { 
        status: 'confirmado',
        paymentId: '123456789'
      },
      include: {
        compra: {
          include: {
            usuario: true
          }
        }
      }
    });

    if (!repasse) {
      console.log('❌ Repasse confirmado não encontrado');
      return;
    }

    console.log('💰 Dados do repasse:');
    console.log(`   ID: ${repasse.id}`);
    console.log(`   Valor: R$ ${repasse.valor}`);
    console.log(`   Status: ${repasse.status}`);
    console.log(`   PaymentId: ${repasse.paymentId}`);
    console.log(`   Usuário da compra: ${repasse.compra.usuario.nome}\n`);

    // Calcular o que deveria ter sido creditado
    const valor = repasse.valor;
    const pctUsuario = Math.round(valor * 0.05);    // 5% para jogador (em sementes)
    
    console.log('🧮 Cálculo das sementes:');
    console.log(`   Valor do repasse: R$ ${valor}`);
    console.log(`   5% de R$ ${valor} = ${pctUsuario} sementes`);
    console.log(`   Sementes atuais do usuário: ${usuario.sementes}`);
    console.log(`   Sementes esperadas: ${pctUsuario}\n`);

    // Verificar histórico de sementes
    const historicoSementes = await prisma.semente.findMany({
      where: { 
        usuarioId: usuario.id,
        descricao: { contains: repasse.id }
      },
      orderBy: { data: 'desc' }
    });

    console.log('📊 Histórico de sementes:');
    if (historicoSementes.length > 0) {
      historicoSementes.forEach((semente, index) => {
        console.log(`   ${index + 1}. ${semente.quantidade} sementes - ${semente.tipo} - ${semente.descricao}`);
      });
    } else {
      console.log('   ❌ Nenhum registro de sementes encontrado para este repasse');
    }

    // Verificar movimentações da carteira
    const carteira = await prisma.carteiraDigital.findUnique({
      where: { usuarioId: usuario.id }
    });

    if (carteira) {
      console.log(`\n💳 Carteira digital:`);
      console.log(`   Saldo atual: R$ ${carteira.saldo}`);

      const movimentacoes = await prisma.movimentacaoCarteira.findMany({
        where: { 
          carteiraId: carteira.id,
          referencia: repasse.id
        },
        orderBy: { data: 'desc' }
      });

      console.log('   Movimentações relacionadas ao repasse:');
      if (movimentacoes.length > 0) {
        movimentacoes.forEach((mov, index) => {
          console.log(`   ${index + 1}. ${mov.tipo} - R$ ${mov.valor} - ${mov.descricao}`);
        });
      } else {
        console.log('   ❌ Nenhuma movimentação encontrada para este repasse');
      }
    }

    // Verificar logs de auditoria
    const logs = await prisma.logAuditoria.findMany({
      where: { 
        acao: 'REPASSE_CONFIRMADO_TESTE',
        detalhes: { contains: repasse.id }
      },
      orderBy: { timestamp: 'desc' },
      take: 1
    });

    if (logs.length > 0) {
      console.log(`\n📝 Log de auditoria:`);
      const detalhes = JSON.parse(logs[0].detalhes);
      console.log(`   Ação: ${logs[0].acao}`);
      console.log(`   pctUsuario calculado: ${detalhes.pctUsuario}`);
      console.log(`   Valor do repasse: R$ ${detalhes.valor}`);
    }

    console.log('\n🔍 Análise:');
    if (usuario.sementes === 0 && pctUsuario > 0) {
      console.log('   ❌ PROBLEMA: Usuário deveria ter recebido sementes mas não recebeu');
      console.log(`   💡 Possível causa: Math.round(${valor} * 0.05) = ${Math.round(valor * 0.05)}`);
      console.log(`   💡 Para R$ 1,00: 1 * 0.05 = 0.05, Math.round(0.05) = 0`);
    } else {
      console.log('   ✅ Sementes estão corretas');
    }

//   } catch (error) {
//     console.error('❌ Erro ao verificar sementes:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// verificarSementesUsuario(); 