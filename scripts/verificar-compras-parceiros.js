const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarComprasParceiros() {
  try {
    console.log('🔍 Verificando compras de parceiros...\n');

    // 1. Verificar todas as compras de parceiros
    console.log('1. Buscando todas as compras de parceiros...');
    const todasCompras = await prisma.compraParceiro.findMany({
      include: {
        usuario: true,
        parceiro: {
          include: {
            usuario: true
          }
        },
        repasse: true
      },
      orderBy: {
        dataCompra: 'desc'
      }
    });

    console.log(`   Encontradas ${todasCompras.length} compras de parceiros no total`);

    if (todasCompras.length === 0) {
      console.log('   ❌ Nenhuma compra de parceiro encontrada no sistema');
      return;
    }

    // 2. Verificar estrutura das compras
    console.log('\n2. Verificando estrutura das compras...');
    todasCompras.forEach((compra, index) => {
      console.log(`   Compra ${index + 1}:`);
      console.log(`     ID: ${compra.id}`);
      console.log(`     Valor: R$ ${compra.valorCompra.toFixed(2)}`);
      console.log(`     Status: ${compra.status}`);
      console.log(`     Cupom: ${compra.cupomUsado}`);
      console.log(`     Parceiro: ${compra.parceiro.usuario.nome}`);
      console.log(`     Usuário: ${compra.usuario.nome}`);
      console.log(`     Data: ${compra.dataCompra}`);
      console.log(`     Repasse ID: ${compra.repasse?.id || 'NÃO CRIADO'}`);
      console.log(`     Repasse Status: ${compra.repasse?.status || 'NÃO CRIADO'}`);
    });

    // 3. Verificar status das compras
    console.log('\n3. Verificando status das compras...');
    const statusCount = {};
    todasCompras.forEach(compra => {
      statusCount[compra.status] = (statusCount[compra.status] || 0) + 1;
    });

    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} compras`);
    });

    // 4. Verificar parceiros
    console.log('\n4. Verificando parceiros...');
    const parceiros = await prisma.parceiro.findMany({
      include: {
        usuario: true
      }
    });

    console.log(`   Encontrados ${parceiros.length} parceiros`);
    parceiros.forEach((parceiro, index) => {
      console.log(`   Parceiro ${index + 1}:`);
      console.log(`     ID: ${parceiro.id}`);
      console.log(`     Nome: ${parceiro.usuario.nome}`);
      console.log(`     Email: ${parceiro.usuario.email}`);
      console.log(`     Saldo Devedor: R$ ${parceiro.saldoDevedor.toFixed(2)}`);
    });

    // 5. Verificar se há compras aguardando repasse
    console.log('\n5. Verificando compras aguardando repasse...');
    const comprasAguardandoRepasse = todasCompras.filter(c => c.status === 'aguardando_repasse');
    console.log(`   Compras aguardando repasse: ${comprasAguardandoRepasse.length}`);

    if (comprasAguardandoRepasse.length > 0) {
      console.log('   Estas compras precisam de repasse:');
      comprasAguardandoRepasse.forEach((compra, index) => {
        console.log(`     ${index + 1}. ID: ${compra.id} | Valor: R$ ${compra.valorCompra.toFixed(2)} | Parceiro: ${compra.parceiro.usuario.nome}`);
      });
    }

    console.log('\n✅ Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarComprasParceiros(); 