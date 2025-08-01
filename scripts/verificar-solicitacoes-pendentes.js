const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarSolicitacoesPendentes() {
  try {
    console.log('🔍 Verificando detalhes das solicitações pendentes...\n');

    const solicitacoesPendentes = await prisma.solicitacaoCompra.findMany({
      where: { status: 'pendente' },
      include: {
        usuario: { select: { nome: true, email: true } },
        parceiro: { 
          include: { usuario: { select: { nome: true } } }
        }
      },
      orderBy: { dataCompra: 'desc' }
    });

    console.log(`📋 SOLICITAÇÕES PENDENTES: ${solicitacoesPendentes.length}\n`);

    solicitacoesPendentes.forEach((solicitacao, index) => {
      console.log(`=== SOLICITAÇÃO ${index + 1} ===`);
      console.log(`ID: ${solicitacao.id}`);
      console.log(`Usuário: ${solicitacao.usuario.nome} (${solicitacao.usuario.email})`);
      console.log(`Parceiro: ${solicitacao.parceiro.usuario.nome}`);
      console.log(`Valor da Compra: R$ ${solicitacao.valorCompra.toFixed(2)}`);
      console.log(`Valor do Repasse (10%): R$ ${(solicitacao.valorCompra * 0.10).toFixed(2)}`);
      console.log(`Status: ${solicitacao.status}`);
      console.log(`Data da Compra: ${solicitacao.dataCompra.toLocaleString()}`);
      console.log(`Comprovante: ${solicitacao.comprovanteUrl || 'Não informado'}`);
      console.log(`Cupom Usado: ${solicitacao.cupomUsado || 'Nenhum'}`);
      console.log('');
    });

    // Verificar se há compras correspondentes
    console.log('🔍 Verificando se há compras correspondentes...\n');
    
    for (const solicitacao of solicitacoesPendentes) {
      const compraCorrespondente = await prisma.compraParceiro.findFirst({
        where: {
          usuarioId: solicitacao.usuarioId,
          parceiroId: solicitacao.parceiroId,
          valorCompra: solicitacao.valorCompra,
          dataCompra: solicitacao.dataCompra
        }
      });

      if (compraCorrespondente) {
        console.log(`✅ Encontrada compra correspondente para solicitação ${solicitacao.id}:`);
        console.log(`   ID da Compra: ${compraCorrespondente.id}`);
        console.log(`   Status da Compra: ${compraCorrespondente.status}`);
        console.log('');
      } else {
        console.log(`❌ Nenhuma compra correspondente encontrada para solicitação ${solicitacao.id}`);
        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarSolicitacoesPendentes(); 