const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testarRepasse50Centavos() {
  try {
    console.log('🧪 Testando repasse de R$ 0,50...\n');

    // Criar compra de teste
    const compra = await prisma.compraParceiro.create({
      data: {
        usuarioId: "cmdqhd1p20000jy04cdq5uo50",
        parceiroId: "cmdrz88y60003l704hg3hb70f",
        valorCompra: 5.00, // R$ 5,00 * 10% = R$ 0,50
        cupomUsado: 'sementesplay20',
        status: 'aprovada',
        dataCompra: new Date()
      }
    });

    console.log('✅ Compra criada:', {
      id: compra.id,
      valorCompra: compra.valorCompra,
      cupomUsado: compra.cupomUsado
    });

    // Calcular repasse (10% da compra)
    const valorRepasse = compra.valorCompra * 0.10; // R$ 0,50

    // Criar repasse
    const repasse = await prisma.repasseParceiro.create({
      data: {
        compraId: compra.id,
        parceiroId: "cmdrz88y60003l704hg3hb70f",
        valor: valorRepasse,
        status: 'confirmado',
        dataRepasse: new Date(),
        paymentId: 'teste_50_centavos'
      }
    });

    console.log('✅ Repasse criado:', {
      id: repasse.id,
      valor: repasse.valor,
      status: repasse.status
    });

    // Calcular distribuição
    const valor = repasse.valor; // R$ 0,50
    const pctUsuario = valor * 0.50; // 0.25 sementes (sem arredondamento)
    const pctSistema = valor * 0.25; // R$ 0,125
    const pctFundo = valor * 0.25; // R$ 0,125

    console.log('\n📊 DISTRIBUIÇÃO CALCULADA:');
    console.log(`Valor do repasse: R$ ${valor.toFixed(2)}`);
    console.log(`Usuário recebe: ${pctUsuario} sementes (R$ ${(pctUsuario * 1).toFixed(2)})`);
    console.log(`Sistema recebe: R$ ${pctSistema.toFixed(2)}`);
    console.log(`Fundo recebe: R$ ${pctFundo.toFixed(2)}`);
    console.log(`Total distribuído: R$ ${(pctUsuario + pctSistema + pctFundo).toFixed(2)}`);

    console.log('\n💡 OBSERVAÇÃO:');
    console.log(`   Com R$ ${valor.toFixed(2)} de repasse:`);
    console.log(`   50% = R$ ${(valor * 0.50).toFixed(2)}`);
    console.log(`   Sem arredondamento = ${pctUsuario} sementes`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testarRepasse50Centavos(); 