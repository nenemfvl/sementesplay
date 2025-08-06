// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function processarPagamentoManual() {
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

    // Calcular distribuição CORRETA
    const pctUsuario = valorRepasse * 0.50; // 50% para usuário (em sementes) - valor exato sem arredondamento
    const pctSistema = valorRepasse * 0.25; // 25% para sistema (em reais)
    const pctFundo = valorRepasse * 0.25; // 25% para fundo (em reais)

    console.log(`📊 DISTRIBUIÇÃO:`);
    console.log(`   Usuário: ${pctUsuario} sementes (50% de R$ ${valorRepasse.toFixed(2)})`);
    console.log(`   Sistema: R$ ${pctSistema.toFixed(3)} (25%)`);
    console.log(`   Fundo: R$ ${pctFundo.toFixed(3)} (25%)`);
    console.log('');

    // Processar em transação simplificada
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
          status: 'pago',
          dataRepasse: new Date()
        }
      });

      // 3. Creditar sementes para o usuário
      await tx.usuario.update({
        where: { id: compra.usuarioId },
        data: { sementes: { increment: pctUsuario } }
      });

      // 4. Criar registro de semente para o usuário
      await tx.semente.create({
        data: {
          usuarioId: compra.usuarioId,
          quantidade: pctUsuario,
          tipo: 'resgatada',
          descricao: `Cashback compra parceiro ${compra.id}`
        }
      });

      return { compraAtualizada, repasse };
    }, {
      timeout: 10000 // Aumentar timeout para 10 segundos
    });

    console.log('✅ PAGAMENTO PROCESSADO COM SUCESSO!');
    console.log(`   Compra ID: ${resultado.compraAtualizada.id}`);
    console.log(`   Repasse ID: ${resultado.repasse.id}`);
    console.log(`   Sementes creditadas: ${pctUsuario}`);
    console.log('');

    // Operações fora da transação para evitar timeout
    try {
      // Atualizar fundo de sementes
      const fundoSementes = await prisma.fundoSementes.findFirst({
        where: { distribuido: false }
      });
      
      if (fundoSementes) {
        await prisma.fundoSementes.update({
          where: { id: fundoSementes.id },
          data: { valorTotal: { increment: pctFundo } }
        });
        console.log('✅ Fundo de sementes atualizado');
      }

      // Criar notificação para o usuário
      await prisma.notificacao.create({
        data: {
          usuarioId: compra.usuarioId,
          titulo: 'Cashback Liberado!',
          mensagem: `Seu cashback de R$ ${valorRepasse.toFixed(2)} foi liberado! Você recebeu ${pctUsuario} sementes.`,
          tipo: 'cashback',
          lida: false
        }
      });
      console.log('✅ Notificação criada para o usuário');

    } catch (error) {
      console.log('⚠️ Erro nas operações secundárias:', error.message);
    }

//   } catch (error) {
//     console.error('❌ Erro ao processar pagamento:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// processarPagamentoManual(); 