// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function verificarWebhookLogs() {
  try {
    console.log('🔍 Verificando logs de webhook...\n');

    // Buscar logs relacionados ao webhook
    const logs = await prisma.logAuditoria.findMany({
      where: {
        OR: [
          { acao: { contains: 'webhook' } },
          { acao: { contains: 'pix' } },
          { acao: { contains: 'pagamento' } },
          { acao: { contains: 'mercado' } }
        ]
      },
      orderBy: { timestamp: 'desc' },
      take: 20
    });

    console.log(`📋 LOGS ENCONTRADOS: ${logs.length}\n`);

    logs.forEach((log, index) => {
      console.log(`=== LOG ${index + 1} ===`);
      console.log(`Data: ${log.timestamp}`);
      console.log(`Ação: ${log.acao}`);
      console.log(`Usuário: ${log.usuarioId}`);
      console.log(`Detalhes: ${log.detalhes}`);
      console.log('');
    });

    // Verificar se há logs de erro
    const logsErro = await prisma.logAuditoria.findMany({
      where: {
        OR: [
          { acao: { contains: 'erro' } },
          { acao: { contains: 'falha' } },
          { acao: { contains: 'failed' } }
        ]
      },
      orderBy: { timestamp: 'desc' },
      take: 10
    });

    if (logsErro.length > 0) {
      console.log(`⚠️ LOGS DE ERRO: ${logsErro.length}\n`);
      logsErro.forEach((log, index) => {
        console.log(`ERRO ${index + 1}: ${log.acao} - ${log.detalhes}`);
      });
    }

//   } catch (error) {
//     console.error('❌ Erro ao verificar logs:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// verificarWebhookLogs(); 