// COMENTADO: Script de desenvolvimento - desabilitado para otimização
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// async function testarNotificacaoManual() {
  try {
    console.log('🔔 Testando criação manual de notificações...\n');

    // Criar notificação de teste
    const notificacao = await prisma.notificacao.create({
      data: {
        usuarioId: "cmdqhd1p20000jy04cdq5uo50", // flavia
        tipo: 'cashback',
        titulo: 'Teste - Cashback liberado!',
        mensagem: 'Teste: Seu cashback da compra foi liberado e você recebeu 1 semente.',
        lida: false
      }
    });

    console.log('✅ Notificação criada:', {
      id: notificacao.id,
      titulo: notificacao.titulo,
      tipo: notificacao.tipo,
      data: notificacao.data.toLocaleString()
    });

    // Criar log de auditoria de teste
    const log = await prisma.logAuditoria.create({
      data: {
        usuarioId: "cmdqhd1p20000jy04cdq5uo50",
        acao: 'TESTE_NOTIFICACAO_MANUAL',
        detalhes: JSON.stringify({
          teste: true,
          timestamp: new Date().toISOString()
        }),
        ip: '127.0.0.1'
      }
    });

    console.log('✅ Log de auditoria criado:', {
      id: log.id,
      acao: log.acao,
      timestamp: log.timestamp.toLocaleString()
    });

    // Verificar se foram criados
    const notificacoes = await prisma.notificacao.findMany({
      where: {
        titulo: {
          contains: 'Teste'
        }
      },
      orderBy: {
        data: 'desc'
      }
    });

    console.log(`\n📧 Notificações de teste encontradas: ${notificacoes.length}`);
    notificacoes.forEach((notif, index) => {
      console.log(`${index + 1}. ID: ${notif.id} | Título: ${notif.titulo} | Tipo: ${notif.tipo} | Data: ${notif.data.toLocaleString()}`);
    });

    const logs = await prisma.logAuditoria.findMany({
      where: {
        acao: {
          contains: 'TESTE'
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    console.log(`\n📝 Logs de teste encontrados: ${logs.length}`);
    logs.forEach((log, index) => {
      console.log(`${index + 1}. ID: ${log.id} | Ação: ${log.acao} | Data: ${log.timestamp.toLocaleString()}`);
    });

//   } catch (error) {
//     console.error('❌ Erro:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// testarNotificacaoManual(); 