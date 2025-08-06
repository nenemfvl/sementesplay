// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function testarWebhookPIX() {
  console.log('🧪 Testando processamento de pagamento PIX...\n');

  try {
    // Buscar repasse pendente
    const repasse = await prisma.repasseParceiro.findFirst({
      where: { status: 'pendente' },
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
      console.log('❌ Nenhum repasse pendente encontrado');
      return;
    }

    console.log('📋 Repasse encontrado:');
    console.log(`   ID: ${repasse.id}`);
    console.log(`   Valor: R$ ${repasse.valor}`);
    console.log(`   Status: ${repasse.status}`);
    console.log(`   Parceiro: ${repasse.compra.parceiro.usuario.nome}`);
    console.log(`   Usuário: ${repasse.compra.usuario.nome}`);
    console.log(`   Compra ID: ${repasse.compra.id}\n`);

    // Simular paymentId do MercadoPago
    const paymentId = '123456789';
    
    console.log('💰 Simulando pagamento aprovado...');
    console.log(`   PaymentId: ${paymentId}`);

    // Atualizar repasse com paymentId e status aguardando_pagamento
    await prisma.repasseParceiro.update({
      where: { id: repasse.id },
      data: { 
        paymentId: paymentId,
        status: 'aguardando_pagamento'
      }
    });

    console.log('✅ Repasse atualizado com paymentId');

    // Simular processamento do webhook
    const compra = repasse.compra;
    const parceiro = repasse.compra.parceiro;
    const usuario = repasse.compra.usuario;

                                       // Calcula as porcentagens
       const valor = repasse.valor;
       const pctUsuario = Math.round(valor * 0.50);    // 50% para jogador (em sementes)
       const pctSistema = valor * 0.25;               // 25% para sistema SementesPLAY
       const pctFundo = valor * 0.25;                 // 25% para fundo de distribuição

    console.log('\n📊 Calculando distribuição:');
    console.log(`   Valor total: R$ ${valor}`);
    console.log(`   Para usuário (5%): ${pctUsuario} sementes`);
    console.log(`   Para sistema (2,5%): R$ ${pctSistema}`);
    console.log(`   Para fundo (2,5%): R$ ${pctFundo}`);

    // Transação: atualiza tudo de uma vez
    await prisma.$transaction(async (tx) => {
      // Atualiza repasse para confirmado
      await tx.repasseParceiro.update({
        where: { id: repasse.id },
        data: { 
          status: 'confirmado',
          dataRepasse: new Date()
        }
      });

      // Atualiza compra para cashback_liberado
      await tx.compraParceiro.update({
        where: { id: compra.id },
        data: { status: 'cashback_liberado' }
      });

      // Atualiza saldo devedor do parceiro
      await tx.parceiro.update({
        where: { id: parceiro.id },
        data: { saldoDevedor: { decrement: valor } }
      });

      // Credita sementes para usuário
      await tx.usuario.update({
        where: { id: compra.usuarioId },
        data: { sementes: { increment: pctUsuario } }
      });
      
      // Registra fundo de sementes
      const fundoExistente = await tx.fundoSementes.findFirst({
        where: { distribuido: false }
      });

      if (fundoExistente) {
        await tx.fundoSementes.update({
          where: { id: fundoExistente.id },
          data: { valorTotal: { increment: pctFundo } }
        });
      } else {
        await tx.fundoSementes.create({
          data: {
            ciclo: 1,
            valorTotal: pctFundo,
            dataInicio: new Date(),
            dataFim: new Date(),
            distribuido: false
          }
        });
      }

      // Registra histórico de sementes para o jogador
      await tx.semente.create({
        data: {
          usuarioId: compra.usuarioId,
          quantidade: pctUsuario,
          tipo: 'resgatada',
          descricao: `Cashback compra parceiro ${compra.id} - Repasse ${repasse.id}`
        }
      });

      // Registra movimentação na carteira do usuário
      const carteira = await tx.carteiraDigital.findUnique({
        where: { usuarioId: compra.usuarioId }
      });
      
      if (carteira) {
        await tx.movimentacaoCarteira.create({
          data: {
            carteiraId: carteira.id,
            tipo: 'credito',
            valor: pctUsuario,
            saldoAnterior: carteira.saldo,
            saldoPosterior: carteira.saldo + pctUsuario,
            descricao: `Cashback liberado - Compra parceiro ${compra.id}`,
            referencia: repasse.id
          }
        });
         
        // Atualiza saldo da carteira
        await tx.carteiraDigital.update({
          where: { id: carteira.id },
          data: { saldo: { increment: pctUsuario } }
        });
      }

      // Registra log do sistema
      await tx.logAuditoria.create({
        data: {
          usuarioId: parceiro.usuarioId,
          acao: 'REPASSE_CONFIRMADO_TESTE',
          detalhes: JSON.stringify({
            repasseId: repasse.id,
            compraId: compra.id,
            parceiroId: parceiro.id,
            usuarioId: usuario.id,
            valor,
            pctUsuario,
            pctSistema,
            pctFundo,
            paymentId: paymentId
          }),
          ip: '127.0.0.1'
        }
      });
    });

    console.log('✅ Transação processada com sucesso!');

    // Verificar resultados
    const repasseAtualizado = await prisma.repasseParceiro.findUnique({
      where: { id: repasse.id },
      include: {
        compra: true
      }
    });

    const usuarioAtualizado = await prisma.usuario.findUnique({
      where: { id: repasse.compra.usuarioId }
    });

    const parceiroAtualizado = await prisma.parceiro.findUnique({
      where: { id: repasse.compra.parceiroId }
    });

    const carteiraAtualizada = await prisma.carteiraDigital.findUnique({
      where: { usuarioId: repasse.compra.usuarioId }
    });

    console.log('\n📋 Resultados após processamento:');
    console.log(`   ✅ Repasse status: ${repasseAtualizado.status}`);
    console.log(`   ✅ Compra status: ${repasseAtualizado.compra.status}`);
    console.log(`   ✅ PaymentId salvo: ${repasseAtualizado.paymentId}`);
    console.log(`   ✅ Sementes do usuário: ${usuarioAtualizado.sementes}`);
    console.log(`   ✅ Saldo devedor do parceiro: R$ ${parceiroAtualizado.saldoDevedor}`);
    console.log(`   ✅ Saldo da carteira: R$ ${carteiraAtualizada ? carteiraAtualizada.saldo : 'N/A'}`);

    // Verificar logs
    const logs = await prisma.logAuditoria.findMany({
      where: { 
        acao: 'REPASSE_CONFIRMADO_TESTE',
        usuarioId: parceiro.usuarioId
      },
      orderBy: { timestamp: 'desc' },
      take: 1
    });

    if (logs.length > 0) {
      console.log(`   ✅ Log de auditoria criado: ${logs[0].id}`);
    }

    console.log('\n🎉 Teste concluído com sucesso!');

//   } catch (error) {
//     console.error('❌ Erro ao testar processamento:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// testarWebhookPIX(); 