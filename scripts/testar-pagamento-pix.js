// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function testarPagamentoPIX() {
  try {
    console.log('🔍 Testando fluxo de pagamento PIX...\n');

    // 1. Buscar todos os repasses
    console.log('1. Buscando todos os repasses...');
    const todosRepasses = await prisma.repasseParceiro.findMany({
      include: {
        compra: {
          include: {
            parceiro: {
              include: {
                usuario: true
              }
            },
            usuario: true
          }
        }
      },
      orderBy: {
        dataRepasse: 'desc'
      },
      take: 10
    });

    console.log(`   Encontrados ${todosRepasses.length} repasses no total`);
    
    if (todosRepasses.length === 0) {
      console.log('   ❌ Nenhum repasse encontrado no sistema');
      return;
    }

    // Filtrar repasses pendentes
    const repassesPendentes = todosRepasses.filter(r => r.status === 'pendente');
    console.log(`   Repasses pendentes: ${repassesPendentes.length}`);

    // 2. Verificar estrutura dos repasses
    console.log('\n2. Verificando estrutura dos repasses...');
    todosRepasses.forEach((repasse, index) => {
      console.log(`   Repasse ${index + 1}:`);
      console.log(`     ID: ${repasse.id}`);
      console.log(`     Valor: R$ ${repasse.valor.toFixed(2)}`);
      console.log(`     Status: ${repasse.status}`);
      console.log(`     PaymentId: ${repasse.paymentId || 'NÃO DEFINIDO'}`);
      console.log(`     Parceiro: ${repasse.compra.parceiro.usuario.nome}`);
      console.log(`     Usuário: ${repasse.compra.usuario.nome}`);
      console.log(`     Compra ID: ${repasse.compra.id}`);
      console.log(`     Data: ${repasse.dataRepasse}`);
    });

    // 3. Verificar se há repasses com paymentId
    console.log('\n3. Verificando repasses com paymentId...');
    const repassesComPaymentId = await prisma.repasseParceiro.findMany({
      where: {
        paymentId: {
          not: null
        }
      },
      select: {
        id: true,
        paymentId: true,
        status: true,
        valor: true
      }
    });

    console.log(`   Encontrados ${repassesComPaymentId.length} repasses com paymentId`);
    repassesComPaymentId.forEach(repasse => {
      console.log(`     ID: ${repasse.id} | PaymentId: ${repasse.paymentId} | Status: ${repasse.status} | Valor: R$ ${repasse.valor.toFixed(2)}`);
    });

    // 4. Verificar repasses confirmados
    console.log('\n4. Verificando repasses confirmados...');
    const repassesConfirmados = await prisma.repasseParceiro.findMany({
      where: {
        status: 'confirmado'
      },
      include: {
        compra: {
          include: {
            usuario: true
          }
        }
      },
      take: 5
    });

    console.log(`   Encontrados ${repassesConfirmados.length} repasses confirmados`);
    repassesConfirmados.forEach((repasse, index) => {
      console.log(`   Repasse ${index + 1}:`);
      console.log(`     ID: ${repasse.id}`);
      console.log(`     Valor: R$ ${repasse.valor.toFixed(2)}`);
      console.log(`     Status: ${repasse.status}`);
      console.log(`     PaymentId: ${repasse.paymentId || 'NÃO DEFINIDO'}`);
      console.log(`     Data Repasse: ${repasse.dataRepasse}`);
      console.log(`     Usuário: ${repasse.compra.usuario.nome}`);
    });

    // 5. Verificar compras com cashback liberado
    console.log('\n5. Verificando compras com cashback liberado...');
    const comprasCashbackLiberado = await prisma.compraParceiro.findMany({
      where: {
        status: 'cashback_liberado'
      },
      include: {
        usuario: true,
        repasse: true
      },
      take: 5
    });

    console.log(`   Encontradas ${comprasCashbackLiberado.length} compras com cashback liberado`);
    comprasCashbackLiberado.forEach((compra, index) => {
      console.log(`   Compra ${index + 1}:`);
      console.log(`     ID: ${compra.id}`);
      console.log(`     Valor: R$ ${compra.valorCompra.toFixed(2)}`);
      console.log(`     Status: ${compra.status}`);
      console.log(`     Usuário: ${compra.usuario.nome}`);
      console.log(`     Repasse ID: ${compra.repasse?.id || 'NÃO ENCONTRADO'}`);
      console.log(`     Repasse Status: ${compra.repasse?.status || 'NÃO ENCONTRADO'}`);
    });

    // 6. Verificar logs de auditoria
    console.log('\n6. Verificando logs de auditoria recentes...');
    const logsRecentes = await prisma.logAuditoria.findMany({
      where: {
        acao: {
          in: ['REPASSE_CONFIRMADO', 'REPASSE_CONFIRMADO_WEBHOOK']
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 5
    });

    console.log(`   Encontrados ${logsRecentes.length} logs de repasse confirmado`);
    logsRecentes.forEach((log, index) => {
      console.log(`   Log ${index + 1}:`);
      console.log(`     Ação: ${log.acao}`);
      console.log(`     Data: ${log.timestamp}`);
      console.log(`     Detalhes: ${log.detalhes.substring(0, 100)}...`);
    });

    // 7. Verificar notificações
    console.log('\n7. Verificando notificações de repasse...');
    const notificacoesRepasse = await prisma.notificacao.findMany({
      where: {
        tipo: 'repasse'
      },
      orderBy: {
        data: 'desc'
      },
      take: 5
    });

    console.log(`   Encontradas ${notificacoesRepasse.length} notificações de repasse`);
    notificacoesRepasse.forEach((notif, index) => {
      console.log(`   Notificação ${index + 1}:`);
      console.log(`     Título: ${notif.titulo}`);
      console.log(`     Mensagem: ${notif.mensagem}`);
      console.log(`     Data: ${notif.data}`);
    });

    console.log('\n✅ Teste concluído!');
    console.log('\n📋 Resumo:');
    console.log(`   - Repasses pendentes: ${repassesPendentes.length}`);
    console.log(`   - Repasses com paymentId: ${repassesComPaymentId.length}`);
    console.log(`   - Repasses confirmados: ${repassesConfirmados.length}`);
    console.log(`   - Compras com cashback liberado: ${comprasCashbackLiberado.length}`);
    console.log(`   - Logs de repasse: ${logsRecentes.length}`);
    console.log(`   - Notificações de repasse: ${notificacoesRepasse.length}`);

//   } catch (error) {
//     console.error('❌ Erro durante o teste:', error);
//     } finally {
//       await prisma.$disconnect();
//     }
//   }

// testarPagamentoPIX(); 