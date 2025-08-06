// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function verificarTodosPendentes() {
  try {
    console.log('🔍 Verificando TODOS os tipos de dados pendentes...\n');

    // 1. Solicitações de compra pendentes
    const solicitacoesPendentes = await prisma.solicitacaoCompra.findMany({
      where: { status: 'pendente' },
      include: {
        usuario: { select: { nome: true } },
        parceiro: { 
          include: { usuario: { select: { nome: true } } }
        }
      },
      orderBy: { dataCompra: 'desc' }
    });

    console.log(`📋 SOLICITAÇÕES PENDENTES: ${solicitacoesPendentes.length}`);
    solicitacoesPendentes.forEach((solicitacao, index) => {
      console.log(`${index + 1}. ID: ${solicitacao.id} | Usuário: ${solicitacao.usuario.nome} | Parceiro: ${solicitacao.parceiro.usuario.nome} | Valor: R$ ${solicitacao.valorCompra.toFixed(2)} | Data: ${solicitacao.dataCompra.toLocaleString()}`);
    });

    // 2. Compras aguardando repasse
    const comprasAguardandoRepasse = await prisma.compraParceiro.findMany({
      where: {
        status: {
          in: ['aguardando_repasse', 'repasse_pendente']
        }
      },
      include: {
        usuario: { select: { nome: true } },
        parceiro: { 
          include: { usuario: { select: { nome: true } } }
        }
      },
      orderBy: { dataCompra: 'desc' }
    });

    console.log(`\n🛒 COMPRAS AGUARDANDO REPASSE: ${comprasAguardandoRepasse.length}`);
    comprasAguardandoRepasse.forEach((compra, index) => {
      console.log(`${index + 1}. ID: ${compra.id} | Usuário: ${compra.usuario.nome} | Parceiro: ${compra.parceiro.usuario.nome} | Valor: R$ ${compra.valorCompra.toFixed(2)} | Status: ${compra.status} | Data: ${compra.dataCompra.toLocaleString()}`);
    });

    // 3. Repasses pendentes
    const repassesPendentes = await prisma.repasseParceiro.findMany({
      where: { status: 'pendente' },
      include: {
        compra: {
          include: {
            usuario: { select: { nome: true } },
            parceiro: { 
              include: { usuario: { select: { nome: true } } }
            }
          }
        }
      },
      orderBy: { dataRepasse: 'desc' }
    });

    console.log(`\n💰 REPASSES PENDENTES: ${repassesPendentes.length}`);
    repassesPendentes.forEach((repasse, index) => {
      console.log(`${index + 1}. ID: ${repasse.id} | Usuário: ${repasse.compra.usuario.nome} | Parceiro: ${repasse.compra.parceiro.usuario.nome} | Valor: R$ ${repasse.valor.toFixed(2)} | Data: ${repasse.dataRepasse.toLocaleString()}`);
    });

    // Total de itens que aparecem na interface
    const totalPendentes = solicitacoesPendentes.length + comprasAguardandoRepasse.length + repassesPendentes.length;
    console.log(`\n📊 TOTAL DE ITENS PENDENTES NA INTERFACE: ${totalPendentes}`);

//   } catch (error) {
//     console.error('❌ Erro:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// verificarTodosPendentes(); 