const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function processarPagamentoManual() {
  try {
    console.log('🔍 Processando pagamento manualmente...\n');

    // Buscar compras aguardando repasse
    const compras = await prisma.compraParceiro.findMany({
      where: { status: 'aguardando_repasse' },
      include: {
        usuario: { select: { nome: true, email: true } },
        parceiro: { 
          include: { usuario: { select: { nome: true } } }
        }
      },
      orderBy: { dataCompra: 'desc' }
    });

    console.log(`📋 COMPRAS AGUARDANDO REPASSE: ${compras.length}\n`);

    if (compras.length === 0) {
      console.log('❌ Nenhuma compra aguardando repasse encontrada');
      return;
    }

    // Processar a primeira compra
    const compra = compras[0];
    console.log('🔄 PROCESSANDO COMPRA:');
    console.log(`ID: ${compra.id}`);
    console.log(`Usuário: ${compra.usuario.nome}`);
    console.log(`Valor: R$ ${compra.valorCompra.toFixed(2)}`);
    console.log(`Data: ${compra.dataCompra}`);
    console.log('');

    // Calcular valor do repasse (10% da compra)
    const valorRepasse = compra.valorCompra * 0.10;
    console.log(`💰 VALOR DO REPASSE: R$ ${valorRepasse.toFixed(2)}`);

    // Calcular distribuição
    const pctUsuario = valorRepasse * 0.50; // 50% para usuário (em sementes)
    const pctSistema = valorRepasse * 0.25; // 25% para sistema
    const pctFundo = valorRepasse * 0.25; // 25% para fundo

    console.log(`📊 DISTRIBUIÇÃO:`);
    console.log(`   Usuário: ${pctUsuario.toFixed(2)} sementes`);
    console.log(`   Sistema: R$ ${pctSistema.toFixed(2)}`);
    console.log(`   Fundo: R$ ${pctFundo.toFixed(2)}`);
    console.log('');

    // Processar em transação
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Atualizar status da compra
      const compraAtualizada = await tx.compraParceiro.update({
        where: { id: compra.id },
        data: { status: 'cashback_liberado' }
      });

      // 2. Criar repasse
      const repasse = await tx.repasseParceiro.create({
        data: {
          parceiroId: compra.parceiroId,
          compraId: compra.id,
          valor: valorRepasse,
          status: 'processado',
          dataRepasse: new Date()
        }
      });

      // 3. Criar registro de semente para o usuário
      await tx.semente.create({
        data: {
          usuarioId: compra.usuarioId,
          quantidade: pctUsuario,
          tipo: 'cashback',
          descricao: `Cashback de R$ ${valorRepasse.toFixed(2)} da compra ${compra.id}`
        }
      });

      // 4. Atualizar fundo de sementes
      const fundoSementes = await tx.fundoSementes.findFirst();
      if (fundoSementes) {
        await tx.fundoSementes.update({
          where: { id: fundoSementes.id },
          data: { valorTotal: { increment: pctFundo } }
        });
      }

      // 6. Criar notificação para o usuário
      await tx.notificacao.create({
        data: {
          usuarioId: compra.usuarioId,
          titulo: 'Cashback Liberado!',
          mensagem: `Seu cashback de R$ ${valorRepasse.toFixed(2)} foi liberado! Você recebeu ${pctUsuario.toFixed(2)} sementes.`,
          tipo: 'cashback_liberado',
          lida: false
        }
      });

      // 7. Criar notificação para o parceiro
      await tx.notificacao.create({
        data: {
          usuarioId: compra.parceiro.usuarioId,
          titulo: 'Repasse Processado!',
          mensagem: `O repasse de R$ ${valorRepasse.toFixed(2)} da compra de ${compra.usuario.nome} foi processado com sucesso.`,
          tipo: 'repasse_processado',
          lida: false
        }
      });

      // 8. Log de auditoria
      await tx.logAuditoria.create({
        data: {
          usuarioId: compra.usuarioId,
          acao: 'pagamento_processado_manual',
          detalhes: `Compra ${compra.id} processada manualmente. Repasse: R$ ${valorRepasse.toFixed(2)}, Sementes: ${pctUsuario.toFixed(2)}`,
          timestamp: new Date()
        }
      });

      return { compraAtualizada, repasse };
    });

    console.log('✅ PAGAMENTO PROCESSADO COM SUCESSO!');
    console.log(`   Compra ID: ${resultado.compraAtualizada.id}`);
    console.log(`   Repasse ID: ${resultado.repasse.id}`);
    console.log('');

  } catch (error) {
    console.error('❌ Erro ao processar pagamento:', error);
  } finally {
    await prisma.$disconnect();
  }
}

processarPagamentoManual(); 