const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testarContabilizacaoDoacoes() {
  try {
    console.log('🔍 Testando contabilização de doações...\n');

    // 1. Verificar todas as doações no sistema
    console.log('1. Verificando todas as doações no sistema:');
    const todasDoacoes = await prisma.doacao.findMany({
      include: {
        doador: { select: { nome: true } },
        criador: { 
          include: { 
            usuario: { select: { nome: true, sementes: true } } 
          } 
        }
      },
      orderBy: { data: 'desc' }
    });

    console.log(`   Total de doações encontradas: ${todasDoacoes.length}`);
    
    if (todasDoacoes.length > 0) {
      console.log('   Últimas 5 doações:');
      todasDoacoes.slice(0, 5).forEach((doacao, index) => {
        console.log(`   ${index + 1}. ${doacao.doador.nome} → ${doacao.criador.usuario.nome}: ${doacao.quantidade} sementes (${doacao.data.toLocaleDateString('pt-BR')})`);
      });
    }

    // 2. Verificar criadores e suas doações recebidas
    console.log('\n2. Verificando criadores e suas doações recebidas:');
    const criadores = await prisma.criador.findMany({
      include: {
        usuario: { select: { nome: true, sementes: true } },
        doacoes: {
          include: {
            doador: { select: { nome: true } }
          }
        }
      }
    });

    console.log(`   Total de criadores: ${criadores.length}`);
    
    criadores.forEach((criador, index) => {
      const totalRecebido = criador.doacoes.reduce((sum, d) => sum + d.quantidade, 0);
      console.log(`   ${index + 1}. ${criador.usuario.nome}:`);
      console.log(`      - Sementes disponíveis: ${criador.usuario.sementes}`);
      console.log(`      - Total de doações recebidas: ${criador.doacoes.length}`);
      console.log(`      - Total de sementes recebidas: ${totalRecebido}`);
      
      if (criador.doacoes.length > 0) {
        console.log(`      - Últimas doações:`);
        criador.doacoes.slice(0, 3).forEach(doacao => {
          console.log(`        * ${doacao.doador.nome}: ${doacao.quantidade} sementes`);
        });
      }
    });

    // 3. Verificar se há discrepâncias
    console.log('\n3. Verificando possíveis discrepâncias:');
    
    const discrepancias = [];
    
    for (const criador of criadores) {
      const totalRecebido = criador.doacoes.reduce((sum, d) => sum + d.quantidade, 0);
      const sementesDisponiveis = criador.usuario.sementes;
      
      if (sementesDisponiveis !== totalRecebido) {
        discrepancias.push({
          criador: criador.usuario.nome,
          sementesDisponiveis,
          totalRecebido,
          diferenca: sementesDisponiveis - totalRecebido
        });
      }
    }

    if (discrepancias.length > 0) {
      console.log('   ⚠️  Discrepâncias encontradas:');
      discrepancias.forEach(d => {
        console.log(`   - ${d.criador}: ${d.sementesDisponiveis} disponíveis vs ${d.totalRecebido} recebidas (diferença: ${d.diferenca})`);
      });
    } else {
      console.log('   ✅ Nenhuma discrepância encontrada');
    }

    // 4. Testar API de estatísticas
    console.log('\n4. Testando API de estatísticas do criador:');
    
    if (criadores.length > 0) {
      const primeiroCriador = criadores[0];
      console.log(`   Testando para: ${primeiroCriador.usuario.nome}`);
      
      // Simular chamada da API
      const estatisticas = {
        totalDoacoes: primeiroCriador.doacoes.length,
        totalSementes: primeiroCriador.doacoes.reduce((sum, d) => sum + d.quantidade, 0),
        totalFavoritos: 0 // Placeholder
      };
      
      console.log(`   - Total de doações: ${estatisticas.totalDoacoes}`);
      console.log(`   - Total de sementes: ${estatisticas.totalSementes}`);
    }

    console.log('\n✅ Teste concluído!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testarContabilizacaoDoacoes(); 