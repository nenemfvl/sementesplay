// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function verificarDistribuicao() {
  console.log('📊 Verificando distribuição dos repasses...\n');

  try {
    // Buscar todos os repasses confirmados
    const repasses = await prisma.repasseParceiro.findMany({
      where: { status: 'confirmado' },
      include: {
        compra: {
          include: {
            usuario: true,
            parceiro: {
              include: {
                usuario: true
              }
            }
          }
        }
      },
      orderBy: { dataRepasse: 'desc' }
    });

    console.log(`📋 Encontrados ${repasses.length} repasses confirmados:\n`);

    let totalValor = 0;
    let totalSementesDistribuidas = 0;
    let totalSistema = 0;
    let totalFundo = 0;

         repasses.forEach((repasse, index) => {
       const valor = repasse.valor;
       const pctUsuario = Math.round(valor * 0.50);    // 50% para jogador
       const pctSistema = valor * 0.25;               // 25% para sistema
       const pctFundo = valor * 0.25;                 // 25% para fundo

      totalValor += valor;
      totalSementesDistribuidas += pctUsuario;
      totalSistema += pctSistema;
      totalFundo += pctFundo;

      console.log(`💰 Repasse ${index + 1}:`);
      console.log(`   ID: ${repasse.id}`);
      console.log(`   Valor: R$ ${valor.toFixed(2)}`);
      console.log(`   Usuário: ${repasse.compra.usuario.nome}`);
      console.log(`   Parceiro: ${repasse.compra.parceiro.usuario.nome}`);
      console.log(`   Data: ${repasse.dataRepasse.toLocaleString()}`);
      console.log(`   Distribuição:`);
      console.log(`     👤 Usuário (50%): ${pctUsuario} sementes`);
      console.log(`     🏢 Sistema (25%): R$ ${pctSistema.toFixed(2)}`);
      console.log(`     💰 Fundo (25%): R$ ${pctFundo.toFixed(2)}`);
      console.log('');
    });

    // Verificar dados do usuário
    const usuario = await prisma.usuario.findFirst({
      where: { nome: 'faafaa' }
    });

    // Verificar carteira
    const carteira = await prisma.carteiraDigital.findUnique({
      where: { usuarioId: usuario.id }
    });

    // Verificar fundo de sementes
    const fundoSementes = await prisma.fundoSementes.findFirst({
      where: { distribuido: false }
    });

    console.log('📈 RESUMO GERAL:');
    console.log(`   💰 Valor total dos repasses: R$ ${totalValor.toFixed(2)}`);
    console.log(`   👤 Sementes distribuídas: ${totalSementesDistribuidas}`);
    console.log(`   🏢 Sistema recebeu: R$ ${totalSistema.toFixed(2)}`);
    console.log(`   💰 Fundo recebeu: R$ ${totalFundo.toFixed(2)}`);
    console.log('');
    console.log('👤 DADOS DO USUÁRIO:');
    console.log(`   Nome: ${usuario.nome}`);
    console.log(`   Sementes atuais: ${usuario.sementes}`);
    console.log(`   Carteira: R$ ${carteira ? carteira.saldo.toFixed(2) : 'N/A'}`);
    console.log('');
    console.log('💰 FUNDO DE SEMENTES:');
    console.log(`   Valor total: R$ ${fundoSementes ? fundoSementes.valorTotal.toFixed(2) : 'N/A'}`);
    console.log(`   Distribuído: ${fundoSementes ? fundoSementes.distribuido : 'N/A'}`);

    // Verificar se os valores batem
    console.log('');
    console.log('🔍 VERIFICAÇÃO:');
    console.log(`   Sementes esperadas: ${totalSementesDistribuidas}`);
    console.log(`   Sementes reais: ${usuario.sementes}`);
    console.log(`   Diferença: ${usuario.sementes - totalSementesDistribuidas}`);
    
    if (usuario.sementes === totalSementesDistribuidas) {
      console.log('   ✅ Distribuição está correta!');
    } else {
      console.log('   ❌ Há diferença na distribuição!');
    }

    // Verificar histórico de sementes
    const historicoSementes = await prisma.semente.findMany({
      where: { 
        usuarioId: usuario.id,
        tipo: 'resgatada'
      },
      orderBy: { data: 'desc' }
    });

    console.log('');
    console.log('📊 HISTÓRICO DE SEMENTES:');
    historicoSementes.forEach((semente, index) => {
      console.log(`   ${index + 1}. ${semente.quantidade} sementes - ${semente.descricao}`);
    });

//   } catch (error) {
//     console.error('❌ Erro ao verificar distribuição:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// verificarDistribuicao(); 