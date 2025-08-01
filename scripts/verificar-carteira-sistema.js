const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarCarteiraSistema() {
  try {
    console.log('🔍 Verificando carteira digital do sistema...\n');

    const carteiras = await prisma.carteiraDigital.findMany({
      select: {
        id: true,
        saldo: true,
        dataCriacao: true
      }
    });

    if (carteiras.length === 0) {
      console.log('❌ Nenhuma carteira digital encontrada');
      return;
    }

    console.log(`✅ Encontradas ${carteiras.length} carteiras:`);
    carteiras.forEach((carteira, index) => {
      console.log(`${index + 1}. ID: ${carteira.id} | Saldo: R$ ${carteira.saldo.toFixed(2)} | Criada em: ${carteira.dataCriacao.toLocaleDateString()}`);
    });

    // Verificar fundo de sementes
    const fundos = await prisma.fundoSementes.findMany({
      select: {
        id: true,
        ciclo: true,
        valorTotal: true,
        distribuido: true
      }
    });

    console.log(`\n🔍 Encontrados ${fundos.length} fundos de sementes:`);
    fundos.forEach((fundo, index) => {
      console.log(`${index + 1}. ID: ${fundo.id} | Ciclo: ${fundo.ciclo} | Valor: R$ ${fundo.valorTotal.toFixed(2)} | Distribuído: ${fundo.distribuido ? 'Sim' : 'Não'}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarCarteiraSistema(); 