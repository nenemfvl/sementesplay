// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function testarRepasse20Reais() {
  try {
    console.log('🧪 Testando repasse de R$ 20,00...\n');

    // Criar compra de teste
    const compra = await prisma.compraParceiro.create({
      data: {
        usuarioId: "cmdqhd1p20000jy04cdq5uo50",
        parceiroId: "cmdrz88y60003l704hg3hb70f",
        valorCompra: 20.00,
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
    const valorRepasse = compra.valorCompra * 0.10; // R$ 2,00

    // Criar repasse
    const repasse = await prisma.repasseParceiro.create({
      data: {
        compraId: compra.id,
        parceiroId: "cmdrz88y60003l704hg3hb70f",
        valor: valorRepasse,
        status: 'confirmado',
        dataRepasse: new Date(),
        paymentId: 'teste_20_reais'
      }
    });

    console.log('✅ Repasse criado:', {
      id: repasse.id,
      valor: repasse.valor,
      status: repasse.status
    });

    // Calcular distribuição
    const valor = repasse.valor; // R$ 2,00
    const pctUsuario = Math.round(valor * 0.50); // 1 semente
    const pctSistema = valor * 0.25; // R$ 0,50
    const pctFundo = valor * 0.25; // R$ 0,50

    console.log('\n📊 DISTRIBUIÇÃO CALCULADA:');
    console.log(`Valor do repasse: R$ ${valor.toFixed(2)}`);
    console.log(`Usuário recebe: ${pctUsuario} sementes (R$ ${(pctUsuario * 1).toFixed(2)})`);
    console.log(`Sistema recebe: R$ ${pctSistema.toFixed(2)}`);
    console.log(`Fundo recebe: R$ ${pctFundo.toFixed(2)}`);
    console.log(`Total distribuído: R$ ${(pctUsuario + pctSistema + pctFundo).toFixed(2)}`);

    // Simular processamento do webhook
    console.log('\n🔄 Simulando processamento do webhook...');

    // Atualizar status do repasse
    await prisma.repasseParceiro.update({
      where: { id: repasse.id },
      data: { status: 'processado' }
    });

    // Creditar sementes ao usuário
    await prisma.usuario.update({
      where: { id: "cmdqhd1p20000jy04cdq5uo50" },
      data: {
        sementes: {
          increment: pctUsuario
        }
      }
    });

    // Creditar ao sistema
    await prisma.carteiraDigital.update({
      where: { id: "cmdt3bpvf0005uj4k85te6ka4" },
      data: {
        saldo: {
          increment: pctSistema
        }
      }
    });

    // Creditar ao fundo
    await prisma.fundoSementes.update({
      where: { id: "cmdt3k4d50000uj0w9gtus8fd" },
      data: {
        valorTotal: {
          increment: pctFundo
        }
      }
    });

    // Atualizar saldo devedor do parceiro
    await prisma.parceiro.update({
      where: { id: "cmdrz88y60003l704hg3hb70f" },
      data: {
        saldoDevedor: {
          increment: valorRepasse
        }
      }
    });

    console.log('✅ Processamento concluído!');

    // Verificar resultados
    const usuarioAtualizado = await prisma.usuario.findUnique({
      where: { id: "cmdqhd1p20000jy04cdq5uo50" },
      select: { sementes: true }
    });

    const carteiraAtualizada = await prisma.carteiraDigital.findUnique({
      where: { id: "cmdt3bpvf0005uj4k85te6ka4" },
      select: { saldo: true }
    });

    const fundoAtualizado = await prisma.fundoSementes.findUnique({
      where: { id: "cmdt3k4d50000uj0w9gtus8fd" },
      select: { valorTotal: true }
    });

    const parceiroAtualizado = await prisma.parceiro.findUnique({
      where: { id: "cmdrz88y60003l704hg3hb70f" },
      select: { saldoDevedor: true }
    });

    console.log('\n📈 RESULTADOS FINAIS:');
    console.log(`Usuário tem: ${usuarioAtualizado.sementes} sementes`);
    console.log(`Carteira do sistema: R$ ${carteiraAtualizada.saldo.toFixed(2)}`);
    console.log(`Fundo de sementes: R$ ${fundoAtualizado.valorTotal.toFixed(2)}`);
    console.log(`Saldo devedor do parceiro: R$ ${parceiroAtualizado.saldoDevedor.toFixed(2)}`);

//   } catch (error) {
//     console.error('❌ Erro:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// testarRepasse20Reais(); 