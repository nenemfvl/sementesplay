// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function testarAprovacaoSolicitacao() {
  try {
    console.log('🔍 Testando aprovação de solicitação...\n');

    // Buscar uma solicitação pendente
    const solicitacao = await prisma.solicitacaoCompra.findFirst({
      where: { status: 'pendente' },
      include: {
        usuario: { select: { nome: true, email: true } },
        parceiro: { 
          include: { usuario: { select: { nome: true } } }
        }
      }
    });

    if (!solicitacao) {
      console.log('❌ Nenhuma solicitação pendente encontrada');
      return;
    }

    console.log('📋 SOLICITAÇÃO ENCONTRADA:');
    console.log(`ID: ${solicitacao.id}`);
    console.log(`Usuário: ${solicitacao.usuario.nome} (${solicitacao.usuario.email})`);
    console.log(`Parceiro: ${solicitacao.parceiro.usuario.nome}`);
    console.log(`Valor: R$ ${solicitacao.valorCompra.toFixed(2)}`);
    console.log(`Status: ${solicitacao.status}`);
    console.log(`Data: ${solicitacao.dataCompra.toLocaleString()}`);
    console.log('');

    // Simular aprovação
    console.log('✅ APROVANDO SOLICITAÇÃO...\n');

    // 1. Atualizar status para aprovada
    await prisma.solicitacaoCompra.update({
      where: { id: solicitacao.id },
      data: {
        status: 'aprovada',
        dataAprovacao: new Date()
      }
    });

    console.log('✅ Status atualizado para "aprovada"');

    // 2. Criar compra efetiva
    const compra = await prisma.compraParceiro.create({
      data: {
        usuarioId: solicitacao.usuarioId,
        parceiroId: solicitacao.parceiroId,
        valorCompra: solicitacao.valorCompra,
        dataCompra: solicitacao.dataCompra,
        comprovanteUrl: solicitacao.comprovanteUrl,
        status: 'aguardando_pagamento',
        cupomUsado: solicitacao.cupomUsado
      }
    });

    console.log('✅ Compra criada:', compra.id);

    // 3. Criar notificação
    const notificacao = await prisma.notificacao.create({
      data: {
        usuarioId: solicitacao.usuarioId,
        titulo: 'Solicitação de Compra Aprovada!',
        mensagem: `Sua solicitação de compra de R$ ${solicitacao.valorCompra.toFixed(2)} foi aprovada pelo parceiro ${solicitacao.parceiro.nomeCidade}. Aguarde o pagamento.`,
        tipo: 'solicitacao_aprovada',
        lida: false
      }
    });

    console.log('✅ Notificação criada:', notificacao.id);

    // Verificar resultado
    console.log('\n🔍 VERIFICANDO RESULTADO...\n');

    const solicitacaoAprovada = await prisma.solicitacaoCompra.findUnique({
      where: { id: solicitacao.id }
    });

    const compraCriada = await prisma.compraParceiro.findUnique({
      where: { id: compra.id }
    });

    const notificacaoCriada = await prisma.notificacao.findUnique({
      where: { id: notificacao.id }
    });

    console.log('📋 SOLICITAÇÃO APÓS APROVAÇÃO:');
    console.log(`Status: ${solicitacaoAprovada.status}`);
    console.log(`Data Aprovação: ${solicitacaoAprovada.dataAprovacao?.toLocaleString()}`);

    console.log('\n🛒 COMPRA CRIADA:');
    console.log(`ID: ${compraCriada.id}`);
    console.log(`Status: ${compraCriada.status}`);
    console.log(`Valor: R$ ${compraCriada.valorCompra.toFixed(2)}`);

    console.log('\n🔔 NOTIFICAÇÃO CRIADA:');
    console.log(`Título: ${notificacaoCriada.titulo}`);
    console.log(`Tipo: ${notificacaoCriada.tipo}`);
    console.log(`Lida: ${notificacaoCriada.lida}`);

    console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!');

//   } catch (error) {
//     console.error('❌ Erro:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// testarAprovacaoSolicitacao(); 