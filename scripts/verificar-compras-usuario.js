// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function verificarComprasUsuario() {
  try {
    console.log('🔍 Verificando compras do usuário faafaa...\n');

    // Buscar usuário faafaa
    const usuario = await prisma.usuario.findFirst({
      where: { nome: 'faafaa' }
    });

    if (!usuario) {
      console.log('❌ Usuário faafaa não encontrado');
      return;
    }

    console.log(`👤 Usuário: ${usuario.nome} (ID: ${usuario.id})\n`);

    // Buscar todas as compras do usuário
    const compras = await prisma.compraParceiro.findMany({
      where: { usuarioId: usuario.id },
      include: {
        parceiro: {
          select: { nomeCidade: true }
        },
        repasse: {
          select: { status: true, dataRepasse: true }
        }
      },
      orderBy: { dataCompra: 'desc' }
    });

    console.log(`📋 TOTAL DE COMPRAS: ${compras.length}\n`);

    // Agrupar por status
    const comprasPorStatus = {};
    compras.forEach(compra => {
      const status = compra.status;
      if (!comprasPorStatus[status]) {
        comprasPorStatus[status] = [];
      }
      comprasPorStatus[status].push(compra);
    });

    // Mostrar compras por status
    Object.keys(comprasPorStatus).forEach(status => {
      const comprasStatus = comprasPorStatus[status];
      console.log(`📊 STATUS: ${status.toUpperCase()} (${comprasStatus.length} compras)`);
      
      comprasStatus.forEach((compra, index) => {
        console.log(`  ${index + 1}. ID: ${compra.id}`);
        console.log(`     Parceiro: ${compra.parceiro.nomeCidade}`);
        console.log(`     Valor: R$ ${compra.valorCompra.toFixed(2)}`);
        console.log(`     Data: ${compra.dataCompra.toLocaleDateString('pt-BR')}`);
        console.log(`     Repasse: ${compra.repasse ? `${compra.repasse.status} (${compra.repasse.dataRepasse?.toLocaleDateString('pt-BR')})` : 'Nenhum'}`);
        console.log('');
      });
    });

    // Verificar se há solicitações pendentes
    const solicitacoes = await prisma.solicitacaoCompra.findMany({
      where: { 
        usuarioId: usuario.id,
        status: 'pendente'
      },
      include: {
        parceiro: {
          select: { nomeCidade: true }
        }
      }
    });

    if (solicitacoes.length > 0) {
      console.log(`📋 SOLICITAÇÕES PENDENTES: ${solicitacoes.length}`);
      solicitacoes.forEach((solicitacao, index) => {
        console.log(`  ${index + 1}. ID: ${solicitacao.id}`);
        console.log(`     Parceiro: ${solicitacao.parceiro.nomeCidade}`);
        console.log(`     Valor: R$ ${solicitacao.valorCompra.toFixed(2)}`);
        console.log(`     Data: ${solicitacao.dataCompra.toLocaleDateString('pt-BR')}`);
        console.log('');
      });
    }

//   } catch (error) {
//     console.error('❌ Erro ao verificar compras:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// verificarComprasUsuario(); 