// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function simularWebhookInterno() {
  try {
    console.log('🔄 Simulando processamento interno do webhook...\n');

    // Buscar repasse confirmado
    const repasse = await prisma.repasseParceiro.findFirst({
      where: { 
        status: 'confirmado',
        paymentId: { not: null }
      },
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
      }
    });

    if (!repasse) {
      console.log('❌ Nenhum repasse confirmado com paymentId encontrado');
      return;
    }

    console.log('📋 Repasse encontrado:');
    console.log(`   ID: ${repasse.id}`);
    console.log(`   PaymentId: ${repasse.paymentId}`);
    console.log(`   Valor: R$ ${repasse.valor}`);
    console.log(`   Status: ${repasse.status}`);
    console.log(`   Parceiro: ${repasse.compra.parceiro.usuario.nome}`);
    console.log(`   Usuário: ${repasse.compra.usuario.nome}`);

    const compra = repasse.compra;
    const parceiro = repasse.compra.parceiro;
    const usuario = repasse.compra.usuario;
    const valor = repasse.valor;

    // Calcular distribuição
    const pctUsuario = Math.round(valor * 0.50);
    const pctSistema = valor * 0.25;
    const pctFundo = valor * 0.25;

    console.log('\n📊 Distribuição calculada:');
    console.log(`   Valor total: R$ ${valor}`);
    console.log(`   Para usuário (50%): ${pctUsuario} sementes`);
    console.log(`   Para sistema (25%): R$ ${pctSistema}`);
    console.log(`   Para fundo (25%): R$ ${pctFundo}`);

    // Processar transação completa
    await prisma.$transaction(async (tx) => {
      // Atualizar status do repasse
      await tx.repasseParceiro.update({
        where: { id: repasse.id },
        data: { status: 'processado' }
      });

      // Atualizar status da compra
      await tx.compraParceiro.update({
        where: { id: compra.id },
        data: { status: 'cashback_liberado' }
      });

      // Atualizar saldo devedor do parceiro
      await tx.parceiro.update({
        where: { id: parceiro.id },
        data: { saldoDevedor: { increment: valor } }
      });

      // Creditar sementes ao usuário
      await tx.usuario.update({
        where: { id: compra.usuarioId },
        data: { sementes: { increment: pctUsuario } }
      });

      // Creditar ao sistema
      const carteira = await tx.carteiraDigital.findFirst();
      if (carteira) {
        await tx.carteiraDigital.update({
          where: { id: carteira.id },
          data: { saldo: { increment: pctSistema } }
        });
      }

      // Creditar ao fundo
      const fundo = await tx.fundoSementes.findFirst({
        where: { distribuido: false }
      });
      if (fundo) {
        await tx.fundoSementes.update({
          where: { id: fundo.id },
          data: { valorTotal: { increment: pctFundo } }
        });
      }

      // Registrar histórico de sementes
      await tx.semente.create({
        data: {
          usuarioId: compra.usuarioId,
          quantidade: pctUsuario,
          tipo: 'resgatada',
          descricao: `Cashback compra parceiro ${compra.id} - Repasse ${repasse.id}`
        }
      });

      // Registrar log de auditoria
      await tx.logAuditoria.create({
        data: {
          usuarioId: parceiro.usuarioId,
          acao: 'REPASSE_CONFIRMADO_WEBHOOK',
          detalhes: JSON.stringify({
            repasseId: repasse.id,
            compraId: compra.id,
            parceiroId: parceiro.id,
            usuarioId: usuario.id,
            valor,
            pctUsuario,
            pctSistema,
            pctFundo,
            paymentId: repasse.paymentId
          }),
          ip: '127.0.0.1'
        }
      });
    });

    console.log('✅ Transação processada com sucesso!');

    // Criar notificações
    await prisma.notificacao.create({
      data: {
        usuarioId: compra.usuarioId,
        tipo: 'cashback',
        titulo: 'Cashback liberado!',
        mensagem: `Seu cashback da compra foi liberado e você recebeu ${pctUsuario} sementes.`,
        lida: false
      }
    });

    await prisma.notificacao.create({
      data: {
        usuarioId: parceiro.usuarioId,
        tipo: 'repasse',
        titulo: 'Repasse confirmado!',
        mensagem: `Seu repasse de R$ ${valor.toFixed(2)} foi confirmado e processado automaticamente.`,
        lida: false
      }
    });

    console.log('✅ Notificações criadas!');

    // Verificar resultados
    const usuarioAtualizado = await prisma.usuario.findUnique({
      where: { id: compra.usuarioId },
      select: { sementes: true }
    });

    const repasseAtualizado = await prisma.repasseParceiro.findUnique({
      where: { id: repasse.id },
      select: { status: true }
    });

    const notificacoes = await prisma.notificacao.findMany({
      where: {
        usuarioId: compra.usuarioId,
        titulo: 'Cashback liberado!'
      },
      orderBy: { data: 'desc' },
      take: 1
    });

    const logs = await prisma.logAuditoria.findMany({
      where: {
        acao: 'REPASSE_CONFIRMADO_WEBHOOK'
      },
      orderBy: { timestamp: 'desc' },
      take: 1
    });

    console.log('\n📈 RESULTADOS FINAIS:');
    console.log(`   Usuário tem: ${usuarioAtualizado.sementes} sementes`);
    console.log(`   Status do repasse: ${repasseAtualizado.status}`);
    console.log(`   Notificações criadas: ${notificacoes.length}`);
    console.log(`   Logs de auditoria criados: ${logs.length}`);

//   } catch (error) {
//     console.error('❌ Erro:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// simularWebhookInterno(); 